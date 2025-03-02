import pytest
import math
from main import calc_eta, calc_eta_sync 

@pytest.mark.asyncio
async def test_calc_eta():
    # Use known locations or a mocked response.
    # For real API calls, ensure you have a test API key or use a staging environment.
    start = "New York, NY"
    destination = "Boston, MA"
    eta = await calc_eta(start, destination)
    # Check if the returned ETA is an integer and greater than 0.
    assert isinstance(eta, int)
    assert eta > 0

def test_calc_eta_sync():
    start = "New York, NY"
    destination = "Boston, MA"
    eta = calc_eta_sync(start, destination)
    assert isinstance(eta, int)
    assert eta > 0
