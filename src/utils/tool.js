function dateToString(date) {
  let time = new Date(date)
  let m =
    time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
  let d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
  return `${time.getFullYear()}-${m}-${d}`
}

function handleDetailTime(date) {
  let time = new Date(date)
  let mount =
    time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
  let day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
  let hours = time.getHours()
  let minu = time.getMinutes()
  return `${time.getFullYear()}年${mount}月${day}日 ${hours}:${minu}`
}

export { dateToString, handleDetailTime }
