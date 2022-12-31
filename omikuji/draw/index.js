function animation(){
  document.querySelector("#omikuji").classList.add("omikuji-animation")
  document.querySelector("input").remove()
  document.querySelector(".box").remove()
  const divBox = document.createElement("div")
  divBox.classList.add("box")
  const divMessage = document.createElement("div")
  divMessage.innerText = "おみくじ抽選中..."
  divBox.appendChild(divMessage)
  document.body.appendChild(divBox)
  setTimeout(() => {window.location.href = "../"}, 10*1000 - 500)
}

function goToOmikujiPage(){
  window.location.href = "../"
}

function load(){
  if(localStorage.getItem(LOCAL_KEY)){
    document.querySelector("#draw-button").setAttribute("value", "自分の結果を見る")
    document.querySelector("#draw-button").setAttribute("onclick", "goToOmikujiPage()")
    return true
  }
  document.querySelector("#draw-button").setAttribute("value", "おみくじを引く")
  document.querySelector("#draw-button").setAttribute("onclick", "animation()")
}

load()