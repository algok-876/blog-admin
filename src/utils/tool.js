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
  hours = hours < 10 ? '0' + hours : hours
  minu = minu < 10 ? '0' + minu : minu
  return `${time.getFullYear()}年${mount}月${day}日 ${hours}:${minu}`
}

// 提取markdown文本中的图片url
function extractMarkdownImages(content) {
  let pattern = /!\[(.*?)\]\((.*?)\)/g
  const imgs = [];
  let matcher;
  while (matcher = pattern.exec(content)) {
    imgs.push(matcher[2])  // matcher[2] 为图片路径
  }
  return imgs;
}

// 对比并返回无用的图片数组
function compareUnusedImage(oldArr, newArr) {
  const delImgs = oldArr.filters(url => {
    return newArr.indexOf(url) < 0
  })
  return delImgs;
}

export {
  dateToString,
  handleDetailTime,
  extractMarkdownImages,
  compareUnusedImage
}
