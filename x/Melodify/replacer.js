let urlParams = new URLSearchParams(window.location.search)

let urlParamString = urlParams.toString()
let youtube = "https://www.youtube.com/embed/".concat(urlParams.get("videoCode"))
youtube = youtube.concat("?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&start=")
youtube = youtube.concat(urlParams.get("startTime"))

let element = document.createElement("iframe")
element.src=youtube
element.width="100%"
element.height="100%"
element.frameBorder="0"
element.allow="accelerometer; autoplay; encrypted - media; gyroscope; picture -in-picture"
element.allowFullscreen=true
document.getElementById("content").appendChild(element)