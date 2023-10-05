import * as XLSX from 'xlsx'

/**
 * 表格数据导出 Excel
 * @param {Array} exportData 导出的数据
 * @param {Array} titleConfig 标题配置 [{ title: 'String/Number', width: Number }]
 * @param {*} sheetName 表sheetName
 * @param {*} fileName 导出的文件名
 */
function export2Excel(exportData: any[], titleConfig: any[] = [], sheetName = 'sheet1', fileName: string | number) {
  if (!fileName) fileName = new Date().getTime()
  // 获取对象长度
  const getLength = function (obj: anyObj) {
    let count = 0
    for (let i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        count++
      }
    }
    return count
  }
  /* convert state to workbook */
  const keyArray = []
  const titleArr = []
  const wscols = []
  const data = []
  for (const key1 in exportData) {
    if (Object.prototype.hasOwnProperty.call(exportData, key1)) {
      const element = exportData[key1]
      const rowDataArray = []
      for (const key2 in element) {
        if (Object.prototype.hasOwnProperty.call(element, key2)) {
          const element2 = element[key2]
          rowDataArray.push(element2)
          if (keyArray.length < getLength(element)) {
            keyArray.push(key2)
          }
        }
      }
      data.push(rowDataArray)
    }
  }
  for (const item of titleConfig) {
    titleArr.push(item.title)
    wscols.push({ wch: item.width || 10 })
  }
  if (!titleArr.length && !wscols.length) {
    keyArray.forEach(item => {
      titleArr.push(item)
      wscols.push({ wch: 10 })
    })
  }

  // wch - 列宽， hpx - 行高

  // keyArray为英文字段表头
  data.splice(0, 0, keyArray, titleArr)
  // console.log('export to excel formatted data =>', data)
  
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  const wsrows = [{ hidden: true }] // 此处隐藏英文字段表头
  worksheet['!rows'] = wsrows
  worksheet['!cols'] = wscols
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  /* generate file and send to client */
  XLSX.writeFile(workbook, fileName + '.xlsx')
}

export default export2Excel
