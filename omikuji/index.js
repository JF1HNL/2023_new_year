function main(){
  const getData = getUrlData() ? getUrlData() : getLocalData()
  const obj = getData ? getData : omikujiHiku()
  display(obj)
  if(!document.location.search){
    const kekkaDiv = document.createElement("div")
    kekkaDiv.classList.add("kekka-message")
    kekkaDiv.innerText = "結果を共有して教えてね！"
    document.body.append(kekkaDiv)

    const tweetDiv = document.createElement("div")
    tweetDiv.classList.add("kekka-message")
    tweetDiv.innerText = "結果をtweetする"
    document.body.append(tweetDiv)

    const tweetButton = document.createElement("i")
    tweetButton.classList.add("fab")
    tweetButton.classList.add("fa-twitter-square")
    tweetButton.classList.add("fa-10x")
    tweetButton.style = "color: #00acee; background-color: white;"
    tweetButton.onclick = function(){tweet(obj)}
    document.body.appendChild(tweetButton)

    const shareDiv = document.createElement("div")
    shareDiv.classList.add("kekka-message")
    shareDiv.innerText = "結果をクリップボードにコピーする"
    document.body.append(shareDiv)

    const shareButton = document.createElement("i")
    shareButton.classList.add("fas")
    shareButton.classList.add("fa-clipboard")
    shareButton.classList.add("fa-10x")
    shareButton.style = "color: rgb(76, 76, 76);"
    shareButton.id = "share"
    shareButton.onclick = function(){share(obj)}
    document.body.appendChild(shareButton)

    const sakunenParent = document.createElement("div")
    sakunenParent.id = "sakunen"
    const sakunenButton = document.createElement("input")
    sakunenButton.value = "2022年のおみくじを確認する"
    sakunenButton.type = "button"
    sakunenButton.onclick = function(){window.open("https://jf1hnl.github.io/2022_new_year/omikuji/")}
    sakunenParent.appendChild(sakunenButton)
    document.body.appendChild(sakunenParent)
  }else{
    const jibun = document.createElement("input")
    jibun.value = "自分のおみくじを引くor確認する"
    jibun.type = "button"
    jibun.onclick = function(){window.location.href = "draw/"}
    document.body.appendChild(jibun)
  }
}

function getUrlData(){
  if(!document.location.search){
    return false
  }
  try {
    const url_param = JSON.parse(`{"${
      document.location.search
      .replace('?', '')
      .replaceAll('&', `","`)
      .replaceAll('=',`":"`)
    }"}`)
    Object.keys(omikujiData).filter(it => it !== "omikuji").forEach(e => {
      url_param[e] = url_param[e].replaceAll("_", "%") // %はtwitterカードに引っかかるために_を使う。もとに戻している。
      if(omikujiData[e].indexOf(url_param[e]) === -1){
        throw new Error('データがない');
      }
    });
    if(omikujiOnlyData.map(it => it.omikuji).indexOf(url_param.omikuji) === -1){
      throw new Error('データがない');
    }
    return url_param
  }
  catch(e){
    console.error('URL取得エラー')
    window.location.href = window.location.href.split('?')[0]
    return false
  }
}

function getLocalData(){
  try {
    if(localStorage.getItem(LOCAL_KEY) === null){
      throw new Error('データがnull')
    }
    const local_data = JSON.parse(localStorage.getItem(LOCAL_KEY))
    return local_data
  }
  catch(e){
    localStorage.removeItem(LOCAL_KEY);
    return false
  }
}

function omikujiHiku(){
  const getRandomNumber = (n) => Math.floor(Math.random() * n)
  const tokudai = omikujiOnlyData[0]
  omikujiData.omikuji = omikujiOnlyData.map((it) => [...Array(it.rate).keys()].map(() => it)).reduce((a,b) => [...a, ...b])
  const nums = Object.keys(omikujiData)
    .map((it) => { return {key : it, num : getRandomNumber(omikujiData[it].length)}})
    .reduce((target, value) => { target[value.key] = value.num; return target }, {})
  let return_obj = Object.keys(nums)
    .map((it) => { return { key : it, value : omikujiData[it][nums[it]]}})
    .reduce((target, value) => {target[value.key] = value.value; return target}, {})
  if(return_obj.omikuji === tokudai){
    return_obj = Object.keys(omikujiData).map((it) => { return {key : it, value : omikujiData[it][0]}}).reduce((target, value) => {target[value.key] = value.value; return target}, {})
    return_obj.omikuji = tokudai
    return_obj.lucky = omikujiData.lucky[nums.lucky]
  }
  return_obj.omikuji = return_obj.omikuji.omikuji
  localStorage.setItem(LOCAL_KEY, JSON.stringify(return_obj))
  return return_obj
}

function makeURL(obj){
  return `${window.location.href.split('?')[0]}?omikuji=${obj.omikuji.replaceAll("%", "_")}&negai=${obj.negai.replaceAll("%", "_")}&kinun=${obj.kinun.replaceAll("%", "_")}&syobu=${obj.syobu.replaceAll("%", "_")}&lucky=${obj.lucky.replaceAll("%", "_")}`
}

function tweet(obj) {
  const content = {
    url: makeURL(obj), // window.location.href,
    text: `おみくじの結果は【${obj.omikuji.decrypt()}】でした！\n詳しくはこちら！ @open_kim_`,
    tag: ["kimおみくじ2023", "おみくじ"]
  };
  for (let key in content) {
    content[key] = encodeURIComponent(content[key]);
  }
  window.open("https://twitter.com/intent/tweet?url=" + content.url + "&text=" + content.text + "&hashtags=" + content.tag)
}

function display(obj){
  document.querySelector('#omikuji').textContent = obj.omikuji.decrypt()
  document.querySelector('#text').textContent = omikujiOnlyData.filter((it) => it.omikuji === obj.omikuji)[0].text.decrypt()
  Object.keys(obj)
    .filter((it) => it !== "omikuji")
    .forEach(e => {
      document.querySelector(`#${e}`).textContent = obj[e].decrypt()
    })
}

function share(obj){
  document.querySelector("#share").classList.remove("fa-clipboard")
  document.querySelector("#share").classList.add("fa-clipboard-check")
  const message = document.createElement("div")
  message.style = "font-size : 5vmin"
  message.id = "share-result"
  if(navigator.clipboard){
    navigator.clipboard.writeText(`おみくじの結果は【${obj.omikuji.decrypt()}】でした！\n詳しくはこちら！\n${makeURL(obj)}`);
    message.innerText = "クリップボードにコピーしました"
  }else{
    message.innerText = "クリップボードにコピーできませんでした。"
  }
  if(document.querySelector("#share-result") === null){
    document.body.insertBefore(message, document.querySelector("#sakunen"))
  }
}

function translated(text, encrypt_flag){
  return text.split("").map((it) => {
    return SYMBOLS.indexOf(it) === -1 ? it : (SYMBOLS.indexOf(it) + ( encrypt_flag ? KEY : -1 * KEY)) % SYMBOLS.length 
  })
  .map((it) => {
    return it < 0 ? SYMBOLS[it + SYMBOLS.length] : SYMBOLS[it]
  }).join("")
}

String.prototype.decrypt = function(){ return decodeURIComponent(translated(this, false)) }
String.prototype.encrypt = function(){ return translated(encodeURIComponent(this), true) }

main()