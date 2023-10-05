export function ParseDate(dateStr: any, dateParameter?: any) :string {

    let date = new Date();
    let retTimeStr = dateParameter || "yyyy-MM-dd HH:mm:ss";

    if (typeof (dateStr) !== "undefined" && dateStr.length > 0) {
        let pattern = new RegExp("^[1-9][0-9]*$");
        dateStr = dateStr.replace(/-/g, "/"); //兼容苹果
        date = pattern.test(dateStr) ? new Date(parseInt(dateStr)) : new Date(dateStr);
    }

    if (date.toString() === "Invalid Date") {
        console.error("dateStr参数异常", dateStr);
        return "";
    }

    //年
    let year = date.getFullYear();
    //月
    let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
    //日
    let day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    //小时
    let hour = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
    //分
    let minute = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
    //秒
    let second = date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();
    //毫秒
    let millisecond = date.getMilliseconds();

    return retTimeStr.replace("yyyy", year)
        .replace("MM", month)
        .replace("dd", day)
        .replace("HH", hour)
        .replace("mm", minute)
        .replace("ss", second)
        .replace("WW", millisecond.toString().substr(0, 2));

}