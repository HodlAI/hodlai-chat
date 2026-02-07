
import requests
from web3 import Web3

RPC = "https://bsc-dataseed.binance.org/"
TOKEN = "0x987e6269c6b7ea6898221882f11ea16f87b97777"
USER = "0x5C6D5a6952Cb5dEC86A975ef28211A531c7185bb"
ABI = [{"constant":True,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]

w3 = Web3(Web3.HTTPProvider(RPC))
contract = w3.eth.contract(address=TOKEN, abi=ABI)
balance_wei = contract.functions.balanceOf(USER).call()
balance = balance_wei / 10**18

# Get Price
url = "https://api.dexscreener.com/latest/dex/pairs/bsc/0x233be6ff451c87d3bde3bab2a8c0c0cdf872003c"
price = 0
try:
    data = requests.get(url).json()
    price = float(data['pairs'][0]['priceUsd'])
except:
    pass

value_usd = balance * price
credits = value_usd * 10

print(f"Address: {USER}")
print(f"Balance: {balance:,.2f} HODLAI")
print(f"Price: ${price:.6f}")
print(f"Value: ${value_usd:.2f}")
print(f"Daily Credits: {credits:.2f}")
print(f"  -> Premium (10): {int(credits / 10)} reqs")
print(f"  -> Standard (5): {int(credits / 5)} reqs")
print(f"  -> Lite (1): {int(credits / 1)} reqs")
