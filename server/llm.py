from dotenv import load_dotenv

load_dotenv()

from openai import AsyncOpenAI
from typing import List, Dict, Any
import os
from custom_types import (
    ResponseRequiredRequest,
    ResponseResponse,
    Utterance,
    ToolCallInvocationResponse,
    ToolCallResultResponse,
    AgentInterruptResponse,
)
from db import update_trans, set_locked
from prompts import (
    authorization_agent_prompt,
    fraud_agent_prompt,
)
import json
from prompts import (
    mid_checkin_prompt,
    final_checkin_prompt,
    beginSentence,
)
from db import set_status 
from db import set_status, notify_emergency_contact
from typing import List, Dict, Any


load_dotenv()

class LlmClient:
    def __init__(self, mode: int, trip_details: dict, traveler_details: dict):
        """
        Initialize LLM client for Traveler Check-In and Safety.

        Args:
            mode (int): Mode 0 = Mid-journey Check-In, Mode 1 = Final Check-In / Emergency, 2 = EC Call
            trips (Dict): Trip details, e.g.:
                {
                    "trip_id": "abc-123",
                    "start_location": "123 Main St",
                    "destination": "456 Elm St",
                    "eta": 45,  # in minutes, including 20% buffer
                    "status": "in progress"
                }
            users (Dict): Traveler details, e.g.:
                {
                    "user_id": "user-789",
                    "first_name": "John",
                    "last_name": "Doe",
                    "device_token": "some_device_token",
                    "phone_number": "555-1234"
                }
        """
        self.client = AsyncOpenAI(
            api_key=os.environ["OPENAI_API_KEY"],
        )
        self.mode = mode
        self.trip_details = trip_details
        self.traveler_details = traveler_details

    async def draft_begin_messsage(self):
        print("Drafting begin message")
        return {
            "response_id": 0,
            "content": beginSentence,
            "content_complete": True,
            "end_call": False,
        }

    def convert_transcript_to_openai_messages(self, transcript: List[Utterance]):
        messages = []
        for utterance in transcript:
            if utterance.role == "agent":
                messages.append({"role": "assistant", "content": utterance.content})
            else:
                messages.append({"role": "user", "content": utterance.content})
        return messages

    def prepare_prompt(self, request: ResponseRequiredRequest):
        prompt_system = mid_checkin_prompt if self.mode == 0 else final_checkin_prompt
        prompt = [
            {
                "role": "system",
                "content": prompt_system,
            },
            {
                "role": "user",
                "content": f"(Trip details: {str(self.trip_details)}. Traveler details: {str(self.traveler_details)})",
            },
        ]
        transcript_messages = self.convert_transcript_to_openai_messages(request.transcript)
        for message in transcript_messages:
            prompt.append(message)

        if request.interaction_type == "reminder_required":
            prompt.append(
                {
                    "role": "user",
                    "content": "(It seems the traveler hasn't responded in a while. What would you say?)",
                }
            )
        return prompt

    def prepare_functions(self)-> List[Dict[str, Any]]:
        """
        Define function calls available to the conversational agent.
        """
        functions = [
            {
                "type": "function",
                "function": {
                    "name": "end_call",
                    "description": "End the call with a custom message",
                    "parameters": {
                        "type": "object",
                        "properties": {"message": {"type": "string"}},
                        "required": ["message"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "updateStatus",
                    "description": "Update the traveler's status based on their check-in response",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "string",
                                "enum": ["safe", "alert", "in-progress"],
                            },
                            "notes": {"type": "string"},
                        },
                        "required": ["status"],
                    },
                },
            },
        ]
        return functions

    async def draft_response(self, request:ResponseRequiredRequest):     
        prompt = self.prepare_prompt(request)
        response_id = request.response_id
        print("Functions:", self.prepare_functions())

        while True:
            func_calls = {}
            stream = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=prompt,
                stream=True,
                tools=self.prepare_functions(),
            )
            tool_calls_detected = False
            # Process streaming response.
            async for chunk in stream:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta

                # Accumulate function call parts.
                if delta.tool_calls:
                    tool_calls_detected = True
                    for tc in delta.tool_calls:
                        idx = tc.index
                        if idx not in func_calls:
                            func_calls[idx] = tc
                        else:
                            func_calls[idx].function.arguments += (tc.function.arguments or "")

                # Yield text content if no tool calls detected.
                if delta.content and not tool_calls_detected:
                    yield ResponseResponse(
                        response_id=response_id,
                        content=delta.content,
                        content_complete=False,
                        end_call=False,
                    )

            print("Accumulated function calls:", func_calls)

            # Exit loop if no tool calls were made.
            if not func_calls:
                break

            # Process each tool call.
            new_messages = []
            for idx in sorted(func_calls.keys()):
                fc = func_calls[idx]
                new_messages.append({"role": "assistant", "tool_calls": [fc], "content": ""})
                try:
                    args = json.loads(fc.function.arguments)
                except Exception:
                    args = {}

                print("Processing function call:", fc.function.name)
                yield ToolCallInvocationResponse(
                    tool_call_id=fc.id,
                    name=fc.function.name,
                    arguments=fc.function.arguments,
                )

                if fc.function.name == "end_call":
                    message = args.get("message", "")
                    print("end_call:", message)
                    yield ResponseResponse(
                        response_id=response_id,
                        content=args.get(message, ""),
                        content_complete=True,
                        end_call=True,
                    )
                    yield ToolCallResultResponse(
                        tool_call_id=fc.id,
                        content=message,
                    )
                    return
                elif fc.function.name == "updateStatus":
                    status = args.get("status")
                    notes = args.get("notes")
                    output = f"Traveler status updated to: {status}. Notes: {notes}"
                    print("Output:", output)
                    # Update the trip status (e.g., call to Supabase DB or API).
                    await set_status(
                        self.trip_details.get("id"),
                        {"status": status},
                    )
                    new_messages.append(
                        {"role": "tool", "tool_call_id": fc.id, "content": output}
                    )
                    yield ToolCallResultResponse(
                        tool_call_id=fc.id,
                        content=output,
                    )

            prompt.extend(new_messages)

        # After all rounds, yield a final complete response.
        yield ResponseResponse(
            response_id=response_id,
            content="",
            content_complete=True,
            end_call=False,
        )
