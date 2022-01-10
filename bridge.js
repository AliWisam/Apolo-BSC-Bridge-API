const { json } = require('body-parser')
const ethers = require('ethers')
const { request } = require('express')
const { from } = require('form-data')

const abi = [
  {
    inputs: [
      { internalType: 'string', name: '_NAME', type: 'string' },
      { internalType: 'string', name: '_SYMBOL', type: 'string' },
      { internalType: 'uint256', name: '_DECIMALS', type: 'uint256' },
      { internalType: 'uint256', name: '_supply', type: 'uint256' },
      { internalType: 'uint256', name: '_txFee', type: 'uint256' },
      { internalType: 'uint256', name: '_lpFee', type: 'uint256' },
      { internalType: 'uint256', name: '_MAXAMOUNT', type: 'uint256' },
      { internalType: 'uint256', name: 'SELLMAXAMOUNT', type: 'uint256' },
      { internalType: 'address', name: 'routerAddress', type: 'address' },
      { internalType: 'address', name: 'tokenOwner', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minTokensBeforeSwap',
        type: 'uint256'
      }
    ],
    name: 'MinTokensBeforeSwapUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokensSwapped',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ethReceived',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokensIntoLiqudity',
        type: 'uint256'
      }
    ],
    name: 'SwapAndLiquify',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' }
    ],
    name: 'SwapAndLiquifyEnabledUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    inputs: [],
    name: '_liquidityFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: '_maxTxAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: '_owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: '_taxFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tAmount', type: 'uint256' }],
    name: 'deliver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'excludeFromFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'excludeFromReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'geUnlockTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'includeInFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'includeInReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' }
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isExcludedFromFee',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isExcludedFromReward',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'time', type: 'uint256' }],
    name: 'lock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'numTokensSellToAddToLiquidity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tAmount', type: 'uint256' },
      { internalType: 'bool', name: 'deductTransferFee', type: 'bool' }
    ],
    name: 'reflectionFromToken',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'liquidityFee', type: 'uint256' }
    ],
    name: 'setLiquidityFeePercent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'maxTxPercent', type: 'uint256' }
    ],
    name: 'setMaxTxPercent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'swapNumber', type: 'uint256' }],
    name: 'setNumTokensSellToAddToLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bool', name: '_enabled', type: 'bool' }],
    name: 'setSwapAndLiquifyEnabled',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'taxFee', type: 'uint256' }],
    name: 'setTaxFeePercent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'swapAndLiquifyEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'rAmount', type: 'uint256' }],
    name: 'tokenFromReflection',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'uniswapV2Pair',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'uniswapV2Router',
    outputs: [
      { internalType: 'contract IUniswapV2Router02', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unlock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  { stateMutability: 'payable', type: 'receive' }
]

const API = 'https://apollowallet.org/apl'
const GXB = ''
const address = ''
const GXBCACCT = ''
const GXBBCACCT = ''
const PKEY = 'private key'
// const SECRET = 'secret phrase';
const SECRET =
  'secret phrase'
const provider = new ethers.providers.JsonRpcProvider(
  'https://data-seed-prebsc-1-s1.binance.org:8545/',
  { name: 'binance', chainId: 97 }
)
const contract = new ethers.Contract(address, abi, provider)
const masterWallet = new ethers.Wallet(PKEY)
const masterSigner = masterWallet.connect(provider)

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */

function sendBEP(to, amt, callBack) {
  const decimals = '000000000000000000'
  const xSigner = contract.connect(masterSigner)
  xSigner
    .transfer(to, amt + '' + decimals, {
      gasLimit: ethers.utils.hexlify(946930),
      gasPrice: ethers.utils.parseUnits('10', 'gwei'),
      value: 0
    })
    .then((res) => {
      console.log('we have an response', res.hash)
      return callBack(null, res.hash)
    })
    .catch(callBack)
}

function getBEP(from, to, amt, callBack) {
  const decimals = '000000000000000000'
  const xSigner = contract.connect(masterSigner)
  console.log('just aboiut to transferFrom')
  xSigner
    .transferFrom(from, to, amt + '' + decimals, {
      gasLimit: ethers.utils.hexlify(946930),
      gasPrice: ethers.utils.parseUnits('10', 'gwei'),
      value: 0
    })
    .then((res) => {
      console.log('we have a response', res.hash)
      res
        .wait()
        .then(function (receipt) {
          console.log(receipt, 'We got the receipt')
          if (receipt.confirmations) {
            console.log('it is confirm now lets swap')
          }
          callBack(null, receipt)
        })
        .catch(callBack)
    })
    .catch(callBack)
}

function getRequestPost(url, params, callBack) {
  var request = require('request')
  request.post(
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      url: url,
      body: params
    },
    callBack
  )
}

function getRequestGet(url, callBack) {
  var request = require('request')
  request.get(
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      url: url
    },
    callBack
  )
}

function confirmGXBSwap(url, gxbbAddr, units, cb) {
  const cB = (error, response, body) => {
    if (error || !body) {
      console.log('we got the error 98')
      console.error(error)
      return cb(error, null)
    } else {
      const json = JSON.parse(body)
      console.log(json, 'is the trans')
      if (json.confirmations) {
        console.log(json, 'transaction is confirmed now')
        return sendBEP(gxbbAddr, units, cb)
      }
    }
  }

  const fn = function () {
    getRequestGet(url, cB)
  }
  setTimeout(fn, 22000)
}

function swapGXB(secret, recipient, units, gxbbAddr, cb) {
  const decimals = '0000000'
  const aplCallBack = (error, response, body) => {
    if (error && !body) {
      console.log('we got the error 123')
      console.error(error)
    } else {
      const json = JSON.parse(body)
      console.log('json.transaction')
      url = API + '?requestType=getTransaction&transaction=' + json.transaction
      console.log(url, 'confirming now')

      confirmGXBSwap(url, gxbbAddr, units, cb)
    }
  }
  // APL-Y67E-CXS4-5V5Y-2ZRA5
  url =
    API +
    `?requestType=transferCurrency&recipient=${recipient}&currency=${GXB}&units=${units}${decimals}&feeATM=100000000&deadline=1`
  params = `secretPhrase=${secret}`
  console.log(url)
  getRequestPost(url, params, aplCallBack)
}

function swapGXBb(recipient, from, amt, callBack) {
  const decimals = '0000000'
  const cb = (error, response, body) => {
    if (error || !body) {
      return callBack(error, null)
    } else {
      const json = JSON.parse(body)
      return callBack(null, json)
    }
  }
  const cB = (err, res) => {
    if (err) {
      return callBack(err, null)
    }
    if (res && res.confirmations) {
      // APL-Y67E-CXS4-5V5Y-2ZRA5
      url =
        API +
        `?requestType=transferCurrency&recipient=${recipient}&currency=${GXB}&units=${amt}${decimals}&feeATM=100000000&deadline=1`
      params = `secretPhrase=${SECRET}`
      console.log(url)
      getRequestPost(url, params, cb)
    }
  }
  getBEP(from, GXBBCACCT, amt, cB)
}
//adress to receive
const gxbbAddr = '0xd9628563324A47e2a28cB506cEEE3247fFe68557'
const units = 1
const recipient = 'APL-Y67E-CXS4-5V5Y-2ZRA5'

const cB = (error, response) => {
  if (error) {
    console.log('we got the error 177')
    console.error(error)
  } else {
    console.log(response, 'is the hash for GXBb')
    console.log(recipient, units, gxbbAddr, 'GXBb sawp')
  }
}
// 1 send apolo and get bsx tokens
// swapGXB(SECRET, recipient, units, gxbbAddr, cB) 
//2 bsc tokens send and recive apolo GXB
swapGXBb(recipient, gxbbAddr, units, cB)

// //giving balance in curreny currency(currenyc ID)
// //working
// const getBalance = async () => {
//   // APL-Y67E-CXS4-5V5Y-2ZRA5
//   url =
//     API +
//     `?requestType=getAccountCurrencies&account=APL-BHHP-NC82-8LZ8-EWN7H&currency=${GXB}`
//   console.log('URL<><><><><><>', url)
//   const { data } = await axios.get(url)
//   console.log('getBalance==============', data)
// }
