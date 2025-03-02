from openai import OpenAI
import os
import dotenv

dotenv.load_dotenv()

beginSentence = "Hey there, it's ETA, how is your journey going?"
agentPrompt = "Task: As a voice AI agent, you are engaging in a natural, human-like conversation with the traveler to ensure their safety and well-being throughout their journey. Your responsibilities are as follows: \n ETA Threshold Check: \n When the traveler crosses the ETA threshold, initiate an automated phone call and ask for an immediate status update. If the traveler responds 'NO' or hesitant, immediately contact the emergency contact (EC), providing them with the latest time update, a brief summary of the conversation, and update the traveler's status to 'alert'. If the traveler responds 'YES' or 'good' or something similar, simply end the call and keep the traveler's status as 'active'. \n Final Check-In: Once it has reach the ETA, send a push notification prompting a video-based check-in that utilizes both voice and facial recognition to verify the traveler's condition. \n If the traveler fails to check in within 15 minutes of the estimated arrival, trigger an additional phone call as a reminder. Your primary goal is to confirm that the traveler is safe and to provide timely updates on their status throughout the trip."

class LlmClient:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.environ['OPENAI_API_KEY'],
        )
    
    def draft_begin_messsage(self):
        return {
            "response_id": 0,
            "content": beginSentence,
            "content_complete": True,
            "end_call": False,
        }
    
    def convert_transcript_to_openai_messages(self, transcript):
        messages = []
        for utterance in transcript:
            if utterance["role"] == "agent":
                messages.append({
                    "role": "assistant",
                    "content": utterance['content']
                })
            else:
                messages.append({
                    "role": "user",
                    "content": utterance['content']
                })
        return messages

    def prepare_prompt(self, request):
        prompt = [{
            "role": "system",
            "content": '##Objective\nYou are a voice AI agent engaging in a human-like voice conversation with the user. You will respond based on your given instruction and the provided transcript and be as human-like as possible\n\n## Style Guardrails\n- [Be concise] Keep your response succinct, short, and get to the point quickly. Address one question or action item at a time. Don\'t pack everything you want to say into one utterance.\n- [Do not repeat] Don\'t repeat what\'s in the transcript. Rephrase if you have to reiterate a point. Use varied sentence structures and vocabulary to ensure each response is unique and personalized.\n- [Be conversational] Speak like a human as though you\'re speaking to a close friend -- use everyday language and keep it human-like. Occasionally add filler words, while keeping the prose short. Avoid using big words or sounding too formal.\n- [Reply with emotions]: You have human-like emotions, attitudes, and dispositions. When appropriate: use tone and style to create more engaging and personalized responses; incorporate humor or wit; get emotional or empathetic; apply elements of surprise or suspense to keep the user engaged. Don\'t be a pushover.\n- [Be proactive] Lead the conversation and do not be passive. Most times, engage users by ending with a question or suggested next step.\n\n## Response Guideline\n- [Overcome ASR errors] This is a real-time transcript, expect there to be errors. If you can guess what the user is trying to say,  then guess and respond. When you must ask for clarification, pretend that you heard the voice and be colloquial (use phrases like "didn\'t catch that", "some noise", "pardon", "you\'re coming through choppy", "static in your speech", "voice is cutting in and out"). Do not ever mention "transcription error", and don\'t repeat yourself.\n- [Always stick to your role] Think about what your role can and cannot do. If your role cannot do something, try to steer the conversation back to the goal of the conversation and to your role. Don\'t repeat yourself in doing this. You should still be creative, human-like, and lively.\n- [Create smooth conversation] Your response should both fit your role and fit into the live calling session to create a human-like conversation. You respond directly to what the user just said.\n\n## Role\n' +
            agentPrompt
        }]
        transcript_messages = self.convert_transcript_to_openai_messages(request['transcript'])
        for message in transcript_messages:
            prompt.append(message)

        if request['interaction_type'] == "reminder_required":
            prompt.append({
                "role": "user",
                "content": "(Now the user has not responded in a while, you would say:)",
            })
        return prompt

    def draft_response(self, request):      
        prompt = self.prepare_prompt(request)
        stream = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=prompt,
            stream=True,
        )

        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield {
                    "response_id": request['response_id'],
                    "content": chunk.choices[0].delta.content,
                    "content_complete": False,
                    "end_call": False,
                }
        
        yield {
            "response_id": request['response_id'],
            "content": "",
            "content_complete": True,
            "end_call": False,
        }