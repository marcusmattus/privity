# ledger-service

Thin FastAPI wrapper around `c8lab.py` from the Cantor8 hackathon toolkit.

## Why this exists

`c8lab.py` handles the two-phase registry transfer correctly — asking the
registry for the transfer factory and choice context, and attaching disclosed
contracts. Hand-building that transfer fails with an error that does not
explain itself. Reimplementing it in TypeScript mid-build is how you lose a day.

## Run against LocalNet

The toolkit flags **DevNet party allocation as unverified** — it may require the
external-party topology flow rather than `POST /v2/parties`. Build on LocalNet.

```bash
git clone https://github.com/Cantor8/hackathon-toolkit vendor/toolkit
cp vendor/toolkit/c8lab.py .
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Verify with the toolkit first: `python3 c8lab.py check` must be green before
anything here will work.
