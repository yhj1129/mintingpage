let account;
let mintIndexForSale = 0;
let maxSaleAmount = 0;
let mintPrice = 0.1;
let mintStartBlockNumber = 0;
let mintLimitPerBlock = 0;

let blockNumber = 0;
let blockCnt = false;

function cntBlockNumber() {
    if(!blockCnt) {
        setInterval(function(){
            blockNumber+=1;
            document.getElementById("blockNubmer").innerHTML = "#" + blockNumber;
        }, 1000);
        blockCnt = true;
    }
}

async function connect() {
    const accounts = await klaytn.enable();
    if (klaytn.networkVersion === 8217) {
        console.log("메인넷");
    } else if (klaytn.networkVersion === 1001) {
        console.log("테스트넷");
    } else {
        alert("ERROR: 클레이튼 네트워크로 연결되지 않았습니다!");
        return;
    }
    account = accounts[0];
    caver.klay.getBalance(account)
        .then(function (balance) {
            // document.getElementById("myWallet").innerHTML = `${account}`
            document.getElementById("myWallet").innerHTML = `     ${account.substr(0,6)} . . . ${account.substr(36,42)}`
            // document.getElementById("myKlay").innerHTML = `잔액: ${caver.utils.fromPeb(balance, "KLAY")} KLAY`
        });
    await check_status();
}

async function check_status() {
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    await myContract.methods.mintingInformation().call()
        .then(function (result) {
            console.log(result);
            mintIndexForSale = parseInt(result[1]);
            mintLimitPerBlock = parseInt(result[2]);
            mintStartBlockNumber = parseInt(result[4]);
            maxSaleAmount = parseInt(result[5]);
            mintPrice = parseInt(result[6]);
            document.getElementById("mintCnt").innerHTML = `${mintIndexForSale - 1} / ${maxSaleAmount}`;
            document.getElementById("mintLimitPerBlock").innerHTML = `${mintLimitPerBlock}개`;
            document.getElementById('amount').max = mintLimitPerBlock;
            document.getElementById("mintStartBlockNumber").innerHTML = `#${mintStartBlockNumber}`;
            // document.getElementById("mintPrice").innerHTML = `${caver.utils.fromPeb(mintPrice, "KLAY")} KLAY`;
        })
        .catch(function (error) {
            console.log(error);
        });
    blockNumber = await caver.klay.getBlockNumber();
    document.getElementById("blockNubmer").innerHTML = "#" + blockNumber;
    cntBlockNumber();
}


async function publicMint() {
    if (klaytn.networkVersion === 8217) {
        console.log("메인넷");
    } else if (klaytn.networkVersion === 1001) {
        console.log("테스트넷");
    } else {
        alert("ERROR: 클레이튼 네트워크로 연결되지 않았습니다!");
        return;
    }
    if (!account) {
        alert("ERROR: 지갑을 연결해주세요!");
        return;
    }
    
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    const amount = document.getElementById('amount').value;
    await check_status();
    
    // const total_value = mintPrice ? BigNumber(amount * mintPrice) : 0;

    const total_value = BigNumber(amount * mintPrice);
    
    
    if (maxSaleAmount + 1 <= mintIndexForSale) {
        alert("모든 물량이 소진되었습니다.");
        return;
    } 
    const gasAmount = await myContract.methods.publicMint(amount).estimateGas({
    from: account,
    gas: 6000000,
    value: total_value
    })
    if (blockNumber <= mintStartBlockNumber) {
        alert("아직 민팅이 시작되지 않았습니다.");
        return;
    }    
    try {
        const gasAmount = await myContract.methods.publicMint(amount).estimateGas({
        from: account,
        gas: 6000000,
        value: total_value
    })
        const result = await myContract.methods.publicMint(amount).send({
            from: account,
            gas: gasAmount,
            value: total_value
        })
        if (result != null) {
            console.log(result);
            alert("민팅에 성공하였습니다.");
        }
        } catch (error) {
            console.log(error);
            alert("민팅에 실패하였습니다.");
        }
    }
