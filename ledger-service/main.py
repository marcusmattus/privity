"""
Privity ledger bridge.

Wraps the Cantor8 hackathon toolkit's c8lab.py rather than reimplementing the
registry transfer flow in TypeScript. c8lab already handles the two-phase
transfer (factory -> choice context -> disclosed contracts) correctly, and
that is not a thing to rewrite under time pressure.

    Next.js server route  ->  THIS SERVICE  ->  Canton Ledger API

This service holds every C8_* credential. It must NOT be reachable from the
browser. Bind it to localhost, or put it on a private network in deployment.

Setup:
    git clone https://github.com/Cantor8/hackathon-toolkit vendor/toolkit
    cp vendor/toolkit/c8lab.py .
    pip install -r requirements.txt
    uvicorn main:app --host 127.0.0.1 --port 8000
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    import c8lab  # stdlib-only, from the Cantor8 toolkit
except ImportError:  # pragma: no cover
    c8lab = None

app = FastAPI(title="privity-ledger-service")


@app.get("/health")
def health():
    if c8lab is None:
        raise HTTPException(503, "c8lab not vendored — see module docstring")
    return {"status": "ok", "toolkit": "loaded"}


class AllocateRequest(BaseModel):
    hint: str


@app.post("/parties")
def allocate_party(req: AllocateRequest):
    """
    Allocate a party, or reuse an existing one.

    Only reuse parties where isLocal is true. A non-local party fails at
    submission with NO_SYNCHRONIZER_ON_WHICH_ALL_SUBMITTERS_CAN_SUBMIT, and
    that error does not explain itself.
    """
    party = c8lab.allocate_party(req.hint)
    return {"partyId": party, "isLocal": True}


@app.get("/holdings/{party}")
def holdings(party: str):
    """
    A balance is a SET OF CONTRACTS, not a number.

    Return the contracts and let the caller sum them. Never cache the total as
    truth — contract count is what determines whether two concurrent transfers
    collide, and the UI surfaces it deliberately.
    """
    contracts = c8lab.holdings(party)
    return {
        "party": party,
        "contracts": contracts,
        "contractCount": len(contracts),
    }


class TransferRequest(BaseModel):
    sender: str
    receiver: str
    amount: str


@app.post("/transfer")
def transfer(req: TransferRequest):
    """
    Returns transferKind, which the caller MUST branch on:

        direct -> settled. Receiver had a live TransferPreapproval.
        offer  -> NOT settled. A TransferInstruction exists and the receiver
                  must accept. The balance has not moved. Do not report success.
        self   -> reject upstream.

    Reporting an 'offer' as settled is the single most damaging bug available
    in this product.
    """
    result = c8lab.transfer(req.sender, req.receiver, req.amount)
    return {
        "transferKind": result.get("transferKind"),
        "instructionCid": result.get("instructionCid"),
        "raw": result,
    }
