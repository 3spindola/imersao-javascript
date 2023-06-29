
require("dotenv").config();
const WebSocket = require("ws");
const axios = require("axios");
const crypto = require("crypto");

const ws = new WebSocket(process.env.STREAM_URL + "btcusdt@bookTicker");

let isOpened = false;
let precoCompra = 26450;
let precoVenda = 26700;
let qtdCompra = 0;
let qtdVenda = 0;

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data);
    console.log("BTC/USDT: " + obj.s);
    console.log("PREÇO: " + obj.a);

    const price = parseFloat(obj.a);

    if(price < precoCompra && !isOpened){
        console.log("Compra realizada com sucesso!=======>Comprar!");
        newOrder("BTCUSDT", "0.001", "BUY");
        isOpened = true;
        console.log(isOpened);
        qtdCompra ++;
        
    } 
    else if( price > precoVenda && isOpened){
        console.log("Venda realizada com sucesso!========> Vender!");
        newOrder("BTCUSDT", "0.001", "SELL");
        isOpened = false;
        console.log(isOpened);
        qtdVenda ++;
        
    }
    console.log("Qtd de compra: "+ qtdCompra);
    console.log("Qtd de Venda: " + qtdVenda);


}
async function newOrder(symbol, quantity, side){
    const data = {symbol, quantity, side};
    data.type = "MARKET";
    data.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", process.env.SECRET_KEY)
        .update(new URLSearchParams(data).toString())
        .digest("hex");

    data.signature = signature;

    const result = await axios({
        method: "POST",
        url: process.env.API_URL + "/v3/order?" + new URLSearchParams(data),
        headers: { "X-MBX-APIKEY": process.env.API_KEY }
    })
    console.log(result.data);

}