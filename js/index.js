window.arweave = Arweave.init();
window.arweave.network.getInfo().then(console.log);

function generateTableRow(title, reward, timestamp, id) {
    return `<tr style="cursor: pointer;" onclick="window.location.href='solve.html?id=${id}';">
                <td><a href="solve.html?id=${id}">${title}</a></td>
                <td>${reward} AR</td>
                <td>${timestamp}</td>
            </tr>`;
}

var startFunc = async () => {
    var txids = await arweave.arql({op: "equals", expr1: "ArVoucher", expr2: window.ARVOUCHER})
    var txns = await Promise.all(txids.map((id) => { return arweave.transactions.get(id); }))

    txns = txns.filter((txn) => { return parseInt(decodeTags(txn)["Version"]) >= window.EARLIEST_VERSION; })

    var vouchersReady = await asyncFilter(txns, async (txn) => { return (await arweave.wallets.getBalance(txn.target)) > 100000 })

    var vouchersCompleted = await asyncFilter(txns, async (txn) => { return (await arweave.wallets.getBalance(txn.target)) < 100000 })
 
    vouchersReady = vouchersReady.map((txn) => {
        var tags = decodeTags(txn)
        return [tags["VoucherName"],
                parseFloat(arweave.ar.winstonToAr(parseInt(tags["Balance"]))).toFixed(8),
                formatDate(parseInt(tags["Timestamp"])),
                txn.id]
    })

    vouchersCompleted = vouchersCompleted.map((txn) => {
        var tags = decodeTags(txn)
        return [tags["VoucherName"],
                parseFloat(arweave.ar.winstonToAr(parseInt(tags["Balance"]))).toFixed(8),
                formatDate(parseInt(tags["Timestamp"])),
                txn.id]
    })


    document.getElementById("open_body").innerHTML = (vouchersReady.map((voucher) => { return generateTableRow(...voucher); })).join("")

   
}

startFunc();

