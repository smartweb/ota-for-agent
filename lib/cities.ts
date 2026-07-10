/**
 * 热门机场 / 城市数据
 * - 机票用 IATA 三字码
 * - 巴士用 6 位行政区划代码（民政部标准），并附带市中心坐标
 *   （巴士接口实际要求 start_addr 或 start_lng+start_lat 提供一组）
 */

export interface AirportCity {
  /** 城市名 */
  city: string;
  /** IATA 三字码（机票用） */
  code: string;
  /** 所在省份 */
  province?: string;
  /** 主要机场名 */
  airport?: string;
  /** 拼音/英文首字母（A-Z），用于字母索引筛选 */
  letter?: string;
  /** 国际/国内标记，"intl" 表示国际城市 */
  intl?: boolean;
}

export interface BusCity {
  /** 城市名 */
  city: string;
  /** 6 位行政区划代码（巴士用） */
  adcode: string;
  province?: string;
  /** 市中心经度 */
  lng?: number;
  /** 市中心纬度 */
  lat?: number;
  /** 市中心地标名（作为 start_addr 兜底） */
  addr?: string;
  /** 拼音首字母（A-Z），用于城市选择面板的 A-Z 索引 */
  letter?: string;
}

/* 机票热门城市（国内，按航线密度选取，含拼音首字母） */
export const POPULAR_AIRPORTS: AirportCity[] = [
  { city: "北京", code: "BJS", province: "北京", airport: "首都/大兴国际机场", letter: "B" },
  { city: "上海", code: "SHA", province: "上海", airport: "虹桥/浦东国际机场", letter: "S" },
  { city: "广州", code: "CAN", province: "广东", airport: "白云国际机场", letter: "G" },
  { city: "深圳", code: "SZX", province: "广东", airport: "宝安国际机场", letter: "S" },
  { city: "成都", code: "CTU", province: "四川", airport: "天府/双流国际机场", letter: "C" },
  { city: "杭州", code: "HGH", province: "浙江", airport: "萧山国际机场", letter: "H" },
  { city: "西安", code: "XIY", province: "陕西", airport: "咸阳国际机场", letter: "X" },
  { city: "重庆", code: "CKG", province: "重庆", airport: "江北国际机场", letter: "C" },
  { city: "昆明", code: "KMG", province: "云南", airport: "长水国际机场", letter: "K" },
  { city: "厦门", code: "XMN", province: "福建", airport: "高崎国际机场", letter: "X" },
  { city: "南京", code: "NKG", province: "江苏", airport: "禄口国际机场", letter: "N" },
  { city: "武汉", code: "WUH", province: "湖北", airport: "天河国际机场", letter: "W" },
  { city: "长沙", code: "CSX", province: "湖南", airport: "黄花国际机场", letter: "C" },
  { city: "青岛", code: "TAO", province: "山东", airport: "胶东国际机场", letter: "Q" },
  { city: "三亚", code: "SYX", province: "海南", airport: "凤凰国际机场", letter: "S" },
  { city: "海口", code: "HAK", province: "海南", airport: "美兰国际机场", letter: "H" },
  { city: "哈尔滨", code: "HRB", province: "黑龙江", airport: "太平国际机场", letter: "H" },
  { city: "大连", code: "DLC", province: "辽宁", airport: "周水子国际机场", letter: "D" },
  { city: "郑州", code: "CGO", province: "河南", airport: "新郑国际机场", letter: "Z" },
  { city: "天津", code: "TSN", province: "天津", airport: "滨海国际机场", letter: "T" },
  { city: "福州", code: "FOC", province: "福建", airport: "长乐国际机场", letter: "F" },
  { city: "济南", code: "TNA", province: "山东", airport: "遥墙国际机场", letter: "J" },
  { city: "贵阳", code: "KWE", province: "贵州", airport: "龙洞堡国际机场", letter: "G" },
  { city: "南昌", code: "KHN", province: "江西", airport: "昌北国际机场", letter: "N" },
  { city: "合肥", code: "HFE", province: "安徽", airport: "新桥国际机场", letter: "H" },
  { city: "沈阳", code: "SHE", province: "辽宁", airport: "桃仙国际机场", letter: "S" },
  { city: "南宁", code: "NNG", province: "广西", airport: "吴圩国际机场", letter: "N" },
  { city: "兰州", code: "LHW", province: "甘肃", airport: "中川国际机场", letter: "L" },
  { city: "乌鲁木齐", code: "URC", province: "新疆", airport: "地窝堡国际机场", letter: "W" },
  { city: "拉萨", code: "LXA", province: "西藏", airport: "贡嘎国际机场", letter: "L" },
  { city: "银川", code: "INC", province: "宁夏", airport: "河东国际机场", letter: "Y" },
  { city: "长春", code: "CGQ", province: "吉林", airport: "龙嘉国际机场", letter: "C" },
  { city: "太原", code: "TYN", province: "山西", airport: "武宿国际机场", letter: "T" },
  { city: "石家庄", code: "SJW", province: "河北", airport: "正定国际机场", letter: "S" },
  { city: "呼和浩特", code: "HET", province: "内蒙古", airport: "白塔国际机场", letter: "H" },
  { city: "温州", code: "WNZ", province: "浙江", airport: "龙湾国际机场", letter: "W" },
  { city: "宁波", code: "NGB", province: "浙江", airport: "栎社国际机场", letter: "N" },
  { city: "无锡", code: "WUX", province: "江苏", airport: "硕放国际机场", letter: "W" },
  { city: "珠海", code: "ZUH", province: "广东", airport: "金湾机场", letter: "Z" },
  /* ---- 以下为补充的国内通航城市（覆盖各地级市民航机场） ---- */
  { city: "安庆", code: "AQG", province: "安徽", airport: "天柱山机场", letter: "A" },
  { city: "鞍山", code: "AOG", province: "辽宁", airport: "腾鳌机场", letter: "A" },
  { city: "包头", code: "BAV", province: "内蒙古", airport: "东河机场", letter: "B" },
  { city: "北海", code: "BHY", province: "广西", airport: "福成机场", letter: "B" },
  { city: "保山", code: "BSD", province: "云南", airport: "云瑞机场", letter: "B" },
  { city: "常州", code: "CZX", province: "江苏", airport: "奔牛国际机场", letter: "C" },
  { city: "承德", code: "CDE", province: "河北", airport: "普宁机场", letter: "C" },
  { city: "赤峰", code: "CIF", province: "内蒙古", airport: "玉龙机场", letter: "C" },
  { city: "潮州", code: "SWA", province: "广东", airport: "揭阳潮汕国际机场", letter: "C" },
  { city: "常德", code: "CGD", province: "湖南", airport: "桃花源机场", letter: "C" },
  { city: "长治", code: "CIH", province: "山西", airport: "王村机场", letter: "C" },
  { city: "沧源", code: "CWJ", province: "云南", airport: "佤山机场", letter: "C" },
  { city: "义乌", code: "YIW", province: "浙江", airport: "义乌机场", letter: "Y" },
  { city: "东营", code: "DOY", province: "山东", airport: "胜利机场", letter: "D" },
  { city: "大同", code: "DAT", province: "山西", airport: "云冈机场", letter: "D" },
  { city: "达州", code: "DAX", province: "四川", airport: "河市机场", letter: "D" },
  { city: "德宏芒市", code: "LUM", province: "云南", airport: "德宏芒市机场", letter: "D" },
  { city: "敦煌", code: "DNH", province: "甘肃", airport: "莫高机场", letter: "D" },
  { city: "鄂尔多斯", code: "DSN", province: "内蒙古", airport: "伊金霍洛国际机场", letter: "E" },
  { city: "恩施", code: "ENH", province: "湖北", airport: "许家坪机场", letter: "E" },
  { city: "佛山", code: "FUO", province: "广东", airport: "沙堤机场", letter: "F" },
  { city: "抚远", code: "FYJ", province: "黑龙江", airport: "东极机场", letter: "F" },
  { city: "赣州", code: "KOW", province: "江西", airport: "黄金机场", letter: "G" },
  { city: "格尔木", code: "GOQ", province: "青海", airport: "格尔木机场", letter: "G" },
  { city: "广元", code: "GYS", province: "四川", airport: "盘龙机场", letter: "G" },
  { city: "固原", code: "GYU", province: "宁夏", airport: "六盘山机场", letter: "G" },
  { city: "海口", code: "HAK", province: "海南", airport: "美兰国际机场", letter: "H" },
  { city: "海拉尔", code: "HLD", province: "内蒙古", airport: "东山国际机场", letter: "H" },
  { city: "邯郸", code: "HDG", province: "河北", airport: "河北机场", letter: "H" },
  { city: "汉中", code: "HZG", province: "陕西", airport: "城固机场", letter: "H" },
  { city: "黑河", code: "HEK", province: "黑龙江", airport: "瑷珲机场", letter: "H" },
  { city: "衡阳", code: "HNY", province: "湖南", airport: "南岳机场", letter: "H" },
  { city: "黄山", code: "TXN", province: "安徽", airport: "屯溪国际机场", letter: "H" },
  { city: "惠州", code: "HUZ", province: "广东", airport: "平潭机场", letter: "H" },
  { city: "佳木斯", code: "JMU", province: "黑龙江", airport: "东郊机场", letter: "J" },
  { city: "嘉峪关", code: "JGN", province: "甘肃", airport: "嘉峪关机场", letter: "J" },
  { city: "揭阳", code: "SWA", province: "广东", airport: "揭阳潮汕国际机场", letter: "J" },
  { city: "金华", code: "JHU", province: "浙江", airport: "义乌机场", letter: "J" },
  { city: "景德镇", code: "JDZ", province: "江西", airport: "罗家机场", letter: "J" },
  { city: "景洪", code: "JHG", province: "云南", airport: "嘎洒国际机场", letter: "J" },
  { city: "九寨沟", code: "JZH", province: "四川", airport: "黄龙机场", letter: "J" },
  { city: "喀什", code: "KHG", province: "新疆", airport: "喀什机场", letter: "K" },
  { city: "克拉玛依", code: "KRY", province: "新疆", airport: "克拉玛依机场", letter: "K" },
  { city: "库尔勒", code: "KRL", province: "新疆", airport: "库尔勒机场", letter: "K" },
  { city: "昆明", code: "KMG", province: "云南", airport: "长水国际机场", letter: "K" },
  { city: "丽江", code: "LJG", province: "云南", airport: "三义国际机场", letter: "L" },
  { city: "连云港", code: "LYG", province: "江苏", airport: "白塔埠机场", letter: "L" },
  { city: "临沂", code: "LYI", province: "山东", airport: "沭埠岭机场", letter: "L" },
  { city: "柳州", code: "LZH", province: "广西", airport: "白莲机场", letter: "L" },
  { city: "泸州", code: "LZO", province: "四川", airport: "云龙机场", letter: "L" },
  { city: "洛阳", code: "LYA", province: "河南", airport: "北郊机场", letter: "L" },
  { city: "梅州", code: "MXZ", province: "广东", airport: "梅县机场", letter: "M" },
  { city: "绵阳", code: "MIG", province: "四川", airport: "南郊机场", letter: "M" },
  { city: "牡丹江", code: "MDG", province: "黑龙江", airport: "海浪机场", letter: "M" },
  { city: "南昌", code: "KHN", province: "江西", airport: "昌北国际机场", letter: "N" },
  { city: "南充", code: "NAO", province: "四川", airport: "高坪机场", letter: "N" },
  { city: "南通", code: "NTG", province: "江苏", airport: "兴东国际机场", letter: "N" },
  { city: "南阳", code: "NNY", province: "河南", airport: "姜营机场", letter: "N" },
  { city: "盘锦", code: "PJC", province: "辽宁", airport: "盘锦机场", letter: "P" },
  { city: "普洱", code: "SYM", province: "云南", airport: "思茅机场", letter: "P" },
  { city: "秦皇岛", code: "SHP", province: "河北", airport: "北戴河机场", letter: "Q" },
  { city: "衢州", code: "JUZ", province: "浙江", airport: "衢州机场", letter: "Q" },
  { city: "泉州", code: "JJN", province: "福建", airport: "晋江国际机场", letter: "Q" },
  { city: "齐齐哈尔", code: "NDG", province: "黑龙江", airport: "三家子机场", letter: "Q" },
  { city: "日喀则", code: "RKZ", province: "西藏", airport: "和平机场", letter: "R" },
  { city: "日照", code: "RIZ", province: "山东", airport: "山字河机场", letter: "R" },
  { city: "汕头", code: "SWA", province: "广东", airport: "揭阳潮汕国际机场", letter: "S" },
  { city: "上饶", code: "SQD", province: "江西", airport: "三清山机场", letter: "S" },
  { city: "韶关", code: "HSC", province: "广东", airport: "丹霞机场", letter: "S" },
  { city: "深圳", code: "SZX", province: "广东", airport: "宝安国际机场", letter: "S" },
  { city: "神农架", code: "HPG", province: "湖北", airport: "红坪机场", letter: "S" },
  { city: "深圳", code: "SZX", province: "广东", airport: "宝安国际机场", letter: "S" },
  { city: "十堰", code: "WDS", province: "湖北", airport: "武当山机场", letter: "S" },
  { city: "石家庄", code: "SJW", province: "河北", airport: "正定国际机场", letter: "S" },
  { city: "塔城", code: "TCG", province: "新疆", airport: "塔城机场", letter: "T" },
  { city: "腾冲", code: "TCZ", province: "云南", airport: "驼峰机场", letter: "T" },
  { city: "通辽", code: "TGO", province: "内蒙古", airport: "通辽机场", letter: "T" },
  { city: "威海", code: "WEH", province: "山东", airport: "大水泊国际机场", letter: "W" },
  { city: "潍坊", code: "WEF", province: "山东", airport: "南苑机场", letter: "W" },
  { city: "温州", code: "WNZ", province: "浙江", airport: "龙湾国际机场", letter: "W" },
  { city: "文山", code: "WNH", province: "云南", airport: "普者黑机场", letter: "W" },
  { city: "无锡", code: "WUX", province: "江苏", airport: "硕放国际机场", letter: "W" },
  { city: "武夷山", code: "WUS", province: "福建", airport: "武夷山机场", letter: "W" },
  { city: "西安", code: "XIY", province: "陕西", airport: "咸阳国际机场", letter: "X" },
  { city: "西昌", code: "XIC", province: "四川", airport: "青山机场", letter: "X" },
  { city: "西双版纳", code: "JHG", province: "云南", airport: "嘎洒国际机场", letter: "X" },
  { city: "锡林浩特", code: "XIL", province: "内蒙古", airport: "锡林浩特机场", letter: "X" },
  { city: "徐州", code: "XUZ", province: "江苏", airport: "观音国际机场", letter: "X" },
  { city: "宜昌", code: "YIH", province: "湖北", airport: "三峡国际机场", letter: "Y" },
  { city: "宜宾", code: "YBP", province: "四川", airport: "五粮液机场", letter: "Y" },
  { city: "延安", code: "ENY", province: "陕西", airport: "南泥湾机场", letter: "Y" },
  { city: "盐城", code: "YNZ", province: "江苏", airport: "南洋国际机场", letter: "Y" },
  { city: "延吉", code: "YNJ", province: "吉林", airport: "朝阳川机场", letter: "Y" },
  { city: "烟台", code: "YNT", province: "山东", airport: "蓬莱国际机场", letter: "Y" },
  { city: "玉树", code: "YUS", province: "青海", airport: "巴塘机场", letter: "Y" },
  { city: "运城", code: "YCU", province: "山西", airport: "张孝机场", letter: "Y" },
  { city: "湛江", code: "ZHA", province: "广东", airport: "吴川机场", letter: "Z" },
  { city: "张家界", code: "DYG", province: "湖南", airport: "荷花国际机场", letter: "Z" },
  { city: "张家口", code: "ZQZ", province: "河北", airport: "宁远机场", letter: "Z" },
  { city: "昭通", code: "ZAT", province: "云南", airport: "昭通机场", letter: "Z" },
  { city: "郑州", code: "CGO", province: "河南", airport: "新郑国际机场", letter: "Z" },
  { city: "中卫", code: "ZHY", province: "宁夏", airport: "沙坡头机场", letter: "Z" },
  { city: "舟山", code: "HSN", province: "浙江", airport: "普陀山机场", letter: "Z" },
  { city: "遵义", code: "ZYI", province: "贵州", airport: "新舟机场", letter: "Z" },
];

/**
 * 国际/地区热门城市（含 IATA 三字码 + 英文首字母）。
 * 用于机票搜索面板的「国际」Tab。
 */
export const INTERNATIONAL_AIRPORTS: AirportCity[] = [
  { city: "香港", code: "HKG", airport: "香港国际机场", letter: "H", intl: true },
  { city: "澳门", code: "MFM", airport: "澳门国际机场", letter: "M", intl: true },
  { city: "台北", code: "TPE", airport: "桃园国际机场", letter: "T", intl: true },
  { city: "东京", code: "NRT", airport: "成田国际机场", letter: "T", intl: true },
  { city: "大阪", code: "KIX", airport: "关西国际机场", letter: "D", intl: true },
  { city: "首尔", code: "ICN", airport: "仁川国际机场", letter: "S", intl: true },
  { city: "新加坡", code: "SIN", airport: "樟宜机场", letter: "X", intl: true },
  { city: "曼谷", code: "BKK", airport: "素万那普国际机场", letter: "M", intl: true },
  { city: "吉隆坡", code: "KUL", airport: "吉隆坡国际机场", letter: "J", intl: true },
  { city: "普吉岛", code: "HKT", airport: "普吉国际机场", letter: "P", intl: true },
  { city: "巴厘岛", code: "DPS", airport: "伍拉·赖国际机场", letter: "B", intl: true },
  { city: "伦敦", code: "LHR", airport: "希思罗机场", letter: "L", intl: true },
  { city: "巴黎", code: "CDG", airport: "戴高乐机场", letter: "B", intl: true },
  { city: "法兰克福", code: "FRA", airport: "法兰克福机场", letter: "F", intl: true },
  { city: "罗马", code: "FCO", airport: "菲乌米奇诺机场", letter: "L", intl: true },
  { city: "莫斯科", code: "SVO", airport: "谢列梅捷沃机场", letter: "M", intl: true },
  { city: "悉尼", code: "SYD", airport: "金斯福德·史密斯机场", letter: "X", intl: true },
  { city: "墨尔本", code: "MEL", airport: "墨尔本机场", letter: "M", intl: true },
  { city: "奥克兰", code: "AKL", airport: "奥克兰机场", letter: "A", intl: true },
  { city: "洛杉矶", code: "LAX", airport: "洛杉矶国际机场", letter: "L", intl: true },
  { city: "旧金山", code: "SFO", airport: "旧金山国际机场", letter: "J", intl: true },
  { city: "纽约", code: "JFK", airport: "肯尼迪国际机场", letter: "N", intl: true },
  { city: "多伦多", code: "YYZ", airport: "皮尔逊国际机场", letter: "D", intl: true },
  { city: "迪拜", code: "DXB", airport: "迪拜国际机场", letter: "D", intl: true },
  { city: "伊斯坦布尔", code: "IST", airport: "伊斯坦布尔机场", letter: "Y", intl: true },
];

/* 巴士热门城市（含行政区划代码 + 市中心坐标 + 拼音首字母）。
 * 城际巴士以地级市为单位，覆盖全国主要经济/人口/旅游城市，
 * 按拼音首字母排序，便于选择面板做 A-Z 索引。 */
export const POPULAR_BUS_CITIES: BusCity[] = [
  { city: "北京", adcode: "110100", province: "北京", lng: 116.4074, lat: 39.9042, addr: "北京市中心", letter: "B" },
  { city: "上海", adcode: "310100", province: "上海", lng: 121.4737, lat: 31.2304, addr: "上海市中心", letter: "S" },
  { city: "广州", adcode: "440100", province: "广东", lng: 113.2644, lat: 23.1291, addr: "广州市中心", letter: "G" },
  { city: "深圳", adcode: "440300", province: "广东", lng: 114.0579, lat: 22.5431, addr: "深圳市中心", letter: "S" },
  { city: "杭州", adcode: "330100", province: "浙江", lng: 120.1486, lat: 30.2741, addr: "杭州市中心", letter: "H" },
  { city: "南京", adcode: "320100", province: "江苏", lng: 118.7969, lat: 32.0603, addr: "南京市中心", letter: "N" },
  { city: "苏州", adcode: "320500", province: "江苏", lng: 120.5853, lat: 31.2989, addr: "苏州市中心", letter: "S" },
  { city: "武汉", adcode: "420100", province: "湖北", lng: 114.3055, lat: 30.5928, addr: "武汉市中心", letter: "W" },
  { city: "成都", adcode: "510100", province: "四川", lng: 104.0665, lat: 30.5728, addr: "成都市中心", letter: "C" },
  { city: "重庆", adcode: "500100", province: "重庆", lng: 106.5516, lat: 29.5630, addr: "重庆市中心", letter: "C" },
  { city: "西安", adcode: "610100", province: "陕西", lng: 108.9398, lat: 34.3416, addr: "西安市市中心", letter: "X" },
  { city: "郑州", adcode: "410100", province: "河南", lng: 113.6253, lat: 34.7466, addr: "郑州市中心", letter: "Z" },
  { city: "长沙", adcode: "430100", province: "湖南", lng: 112.9388, lat: 28.2278, addr: "长沙市中心", letter: "C" },
  { city: "济南", adcode: "370100", province: "山东", lng: 117.1205, lat: 36.6510, addr: "济南市中心", letter: "J" },
  { city: "青岛", adcode: "370200", province: "山东", lng: 120.3826, lat: 36.0671, addr: "青岛市中心", letter: "Q" },
  { city: "厦门", adcode: "350200", province: "福建", lng: 118.0894, lat: 24.4798, addr: "厦门市中心", letter: "X" },
  { city: "福州", adcode: "350100", province: "福建", lng: 119.2965, lat: 26.0745, addr: "福州市中心", letter: "F" },
  { city: "合肥", adcode: "340100", province: "安徽", lng: 117.2272, lat: 31.8206, addr: "合肥市中心", letter: "H" },
  { city: "天津", adcode: "120100", province: "天津", lng: 117.2010, lat: 39.0842, addr: "天津市中心", letter: "T" },
  { city: "昆明", adcode: "530100", province: "云南", lng: 102.8329, lat: 24.8801, addr: "昆明市中心", letter: "K" },
  { city: "南昌", adcode: "360100", province: "江西", lng: 115.8581, lat: 28.6832, addr: "南昌市中心", letter: "N" },
  { city: "贵阳", adcode: "520100", province: "贵州", lng: 106.7135, lat: 26.5783, addr: "贵阳市中心", letter: "G" },
  { city: "南宁", adcode: "450100", province: "广西", lng: 108.3669, lat: 22.8170, addr: "南宁市中心", letter: "N" },
  { city: "兰州", adcode: "620100", province: "甘肃", lng: 103.8343, lat: 36.0613, addr: "兰州市中心", letter: "L" },
  { city: "太原", adcode: "140100", province: "山西", lng: 112.5489, lat: 37.8706, addr: "太原市中心", letter: "T" },
  { city: "石家庄", adcode: "130100", province: "河北", lng: 114.5149, lat: 38.0428, addr: "石家庄市中心", letter: "S" },
  { city: "哈尔滨", adcode: "230100", province: "黑龙江", lng: 126.5340, lat: 45.8033, addr: "哈尔滨市中心", letter: "H" },
  { city: "长春", adcode: "220100", province: "吉林", lng: 125.3235, lat: 43.8171, addr: "长春市中心", letter: "C" },
  { city: "沈阳", adcode: "210100", province: "辽宁", lng: 123.4290, lat: 41.7968, addr: "沈阳市中心", letter: "S" },
  { city: "大连", adcode: "210200", province: "辽宁", lng: 121.6147, lat: 38.9140, addr: "大连市中心", letter: "D" },
  { city: "温州", adcode: "330300", province: "浙江", lng: 120.6992, lat: 27.9938, addr: "温州市中心", letter: "W" },
  { city: "宁波", adcode: "330200", province: "浙江", lng: 121.5497, lat: 29.8683, addr: "宁波市中心", letter: "N" },
  { city: "无锡", adcode: "320200", province: "江苏", lng: 120.3017, lat: 31.5747, addr: "无锡市中心", letter: "W" },
  { city: "常州", adcode: "320400", province: "江苏", lng: 119.9740, lat: 31.8116, addr: "常州市中心", letter: "C" },
  { city: "徐州", adcode: "320300", province: "江苏", lng: 117.2846, lat: 34.2058, addr: "徐州市中心", letter: "X" },
  { city: "扬州", adcode: "321000", province: "江苏", lng: 119.4210, lat: 32.3932, addr: "扬州市中心", letter: "Y" },
  { city: "南通", adcode: "320600", province: "江苏", lng: 120.8946, lat: 31.9811, addr: "南通市中心", letter: "N" },
  { city: "盐城", adcode: "320900", province: "江苏", lng: 120.1631, lat: 33.3479, addr: "盐城市中心", letter: "Y" },
  { city: "泰州", adcode: "321200", province: "江苏", lng: 119.9229, lat: 32.4554, addr: "泰州市中心", letter: "T" },
  { city: "镇江", adcode: "321100", province: "江苏", lng: 119.4528, lat: 32.2044, addr: "镇江市中心", letter: "Z" },
  { city: "连云港", adcode: "320700", province: "江苏", lng: 119.2216, lat: 34.5968, addr: "连云港市中心", letter: "L" },
  { city: "佛山", adcode: "440600", province: "广东", lng: 113.1228, lat: 23.0288, addr: "佛山市中心", letter: "F" },
  { city: "东莞", adcode: "441900", province: "广东", lng: 113.7518, lat: 23.0207, addr: "东莞市中心", letter: "D" },
  { city: "中山", adcode: "442000", province: "广东", lng: 113.3927, lat: 22.5176, addr: "中山市中心", letter: "Z" },
  { city: "珠海", adcode: "440400", province: "广东", lng: 113.5767, lat: 22.2710, addr: "珠海市中心", letter: "Z" },
  { city: "惠州", adcode: "441300", province: "广东", lng: 114.4153, lat: 23.1115, addr: "惠州市中心", letter: "H" },
  { city: "汕头", adcode: "440500", province: "广东", lng: 116.6822, lat: 23.3535, addr: "汕头市中心", letter: "S" },
  { city: "湛江", adcode: "440800", province: "广东", lng: 110.3594, lat: 21.2706, addr: "湛江市中心", letter: "Z" },
  { city: "江门", adcode: "440700", province: "广东", lng: 113.0823, lat: 22.5790, addr: "江门市中心", letter: "J" },
  { city: "茂名", adcode: "440900", province: "广东", lng: 110.9192, lat: 21.6630, addr: "茂名市中心", letter: "M" },
  { city: "清远", adcode: "441800", province: "广东", lng: 113.0510, lat: 23.6857, addr: "清远市中心", letter: "Q" },
  { city: "烟台", adcode: "370600", province: "山东", lng: 121.4479, lat: 37.4638, addr: "烟台市中心", letter: "Y" },
  { city: "潍坊", adcode: "370700", province: "山东", lng: 119.1619, lat: 36.7068, addr: "潍坊市中心", letter: "W" },
  { city: "临沂", adcode: "371300", province: "山东", lng: 118.3564, lat: 35.1046, addr: "临沂市中心", letter: "L" },
  { city: "淄博", adcode: "370300", province: "山东", lng: 118.0548, lat: 36.8131, addr: "淄博市中心", letter: "Z" },
  { city: "威海", adcode: "371000", province: "山东", lng: 122.1201, lat: 37.5130, addr: "威海市中心", letter: "W" },
  { city: "泰安", adcode: "370900", province: "山东", lng: 117.0894, lat: 36.2003, addr: "泰安市中心", letter: "T" },
  { city: "洛阳", adcode: "410300", province: "河南", lng: 112.4540, lat: 34.6197, addr: "洛阳市中心", letter: "L" },
  { city: "开封", adcode: "410200", province: "河南", lng: 114.3073, lat: 34.7955, addr: "开封市中心", letter: "K" },
  { city: "新乡", adcode: "410700", province: "河南", lng: 113.9268, lat: 35.3030, addr: "新乡市中心", letter: "X" },
  { city: "九江", adcode: "360400", province: "江西", lng: 116.0015, lat: 29.7050, addr: "九江市中心", letter: "J" },
  { city: "赣州", adcode: "360700", province: "江西", lng: 114.9350, lat: 25.8314, addr: "赣州市中心", letter: "G" },
  { city: "上饶", adcode: "361100", province: "江西", lng: 117.9430, lat: 28.4546, addr: "上饶市中心", letter: "S" },
  { city: "泉州", adcode: "350500", province: "福建", lng: 118.5894, lat: 24.9089, addr: "泉州市中心", letter: "Q" },
  { city: "莆田", adcode: "350300", province: "福建", lng: 119.0077, lat: 25.4310, addr: "莆田市中心", letter: "P" },
  { city: "漳州", adcode: "350600", province: "福建", lng: 117.6470, lat: 24.5130, addr: "漳州市中心", letter: "Z" },
  { city: "龙岩", adcode: "350800", province: "福建", lng: 117.0173, lat: 25.0755, addr: "龙岩市中心", letter: "L" },
  { city: "海口", adcode: "460100", province: "海南", lng: 110.3312, lat: 20.0440, addr: "海口市中心", letter: "H" },
  { city: "三亚", adcode: "460200", province: "海南", lng: 109.5180, lat: 18.2528, addr: "三亚市中心", letter: "S" },
  { city: "保定", adcode: "130600", province: "河北", lng: 115.4646, lat: 38.8736, addr: "保定市中心", letter: "B" },
  { city: "唐山", adcode: "130200", province: "河北", lng: 118.1802, lat: 39.6306, addr: "唐山市中心", letter: "T" },
  { city: "廊坊", adcode: "131000", province: "河北", lng: 116.6837, lat: 39.5387, addr: "廊坊市中心", letter: "L" },
  { city: "沧州", adcode: "130900", province: "河北", lng: 116.8574, lat: 38.3105, addr: "沧州市中心", letter: "C" },
  { city: "邯郸", adcode: "130400", province: "河北", lng: 114.5391, lat: 36.3663, addr: "邯郸市中心", letter: "H" },
  { city: "秦皇岛", adcode: "130300", province: "河北", lng: 119.6044, lat: 39.9454, addr: "秦皇岛市中心", letter: "Q" },
  { city: "呼和浩特", adcode: "150100", province: "内蒙古", lng: 111.7519, lat: 40.8414, addr: "呼和浩特市中心", letter: "H" },
  { city: "包头", adcode: "150200", province: "内蒙古", lng: 109.8403, lat: 40.6574, addr: "包头市中心", letter: "B" },
  { city: "鄂尔多斯", adcode: "150600", province: "内蒙古", lng: 109.9906, lat: 39.8172, addr: "鄂尔多斯市中心", letter: "E" },
  { city: "赤峰", adcode: "150400", province: "内蒙古", lng: 118.9568, lat: 42.2753, addr: "赤峰市中心", letter: "C" },
  { city: "乌鲁木齐", adcode: "650100", province: "新疆", lng: 87.6168, lat: 43.8256, addr: "乌鲁木齐市中心", letter: "W" },
  { city: "银川", adcode: "640100", province: "宁夏", lng: 106.2308, lat: 38.4872, addr: "银川市中心", letter: "Y" },
  { city: "西宁", adcode: "630100", province: "青海", lng: 101.7782, lat: 36.6171, addr: "西宁市中心", letter: "X" },
  { city: "拉萨", adcode: "540100", province: "西藏", lng: 91.1409, lat: 29.6457, addr: "拉萨市中心", letter: "L" },
  { city: "桂林", adcode: "450300", province: "广西", lng: 110.2902, lat: 25.2744, addr: "桂林市中心", letter: "G" },
  { city: "柳州", adcode: "450200", province: "广西", lng: 109.4282, lat: 24.3260, addr: "柳州市中心", letter: "L" },
  { city: "北海", adcode: "450500", province: "广西", lng: 109.1197, lat: 21.4733, addr: "北海市中心", letter: "B" },
  { city: "玉林", adcode: "450900", province: "广西", lng: 110.1544, lat: 22.6310, addr: "玉林市中心", letter: "Y" },
  { city: "大理", adcode: "532901", province: "云南", lng: 100.2257, lat: 25.5894, addr: "大理市中心", letter: "D" },
  { city: "丽江", adcode: "530700", province: "云南", lng: 100.2330, lat: 26.8721, addr: "丽江市中心", letter: "L" },
  { city: "曲靖", adcode: "530300", province: "云南", lng: 103.7977, lat: 25.5016, addr: "曲靖市中心", letter: "Q" },
  { city: "遵义", adcode: "520300", province: "贵州", lng: 106.9271, lat: 27.7253, addr: "遵义市中心", letter: "Z" },
  { city: "六盘水", adcode: "520200", province: "贵州", lng: 104.8307, lat: 26.5943, addr: "六盘水市中心", letter: "L" },
  { city: "宜昌", adcode: "420500", province: "湖北", lng: 111.2864, lat: 30.6916, addr: "宜昌市中心", letter: "Y" },
  { city: "襄阳", adcode: "420600", province: "湖北", lng: 112.1224, lat: 32.0090, addr: "襄阳市中心", letter: "X" },
  { city: "十堰", adcode: "420300", province: "湖北", lng: 110.7982, lat: 32.6293, addr: "十堰市中心", letter: "S" },
  { city: "荆州", adcode: "421000", province: "湖北", lng: 112.2389, lat: 30.3264, addr: "荆州市中心", letter: "J" },
  { city: "岳阳", adcode: "430600", province: "湖南", lng: 113.1289, lat: 29.3563, addr: "岳阳市中心", letter: "Y" },
  { city: "株洲", adcode: "430200", province: "湖南", lng: 113.1339, lat: 27.8275, addr: "株洲市中心", letter: "Z" },
  { city: "湘潭", adcode: "430300", province: "湖南", lng: 112.9440, lat: 27.8297, addr: "湘潭市中心", letter: "X" },
  { city: "衡阳", adcode: "430400", province: "湖南", lng: 112.6073, lat: 26.9004, addr: "衡阳市中心", letter: "H" },
  { city: "常德", adcode: "430700", province: "湖南", lng: 111.6986, lat: 29.0317, addr: "常德市中心", letter: "C" },
  { city: "益阳", adcode: "430900", province: "湖南", lng: 112.3553, lat: 28.5539, addr: "益阳市中心", letter: "Y" },
  { city: "绵阳", adcode: "510700", province: "四川", lng: 104.7410, lat: 31.4640, addr: "绵阳市中心", letter: "M" },
  { city: "南充", adcode: "511300", province: "四川", lng: 106.1107, lat: 30.8374, addr: "南充市中心", letter: "N" },
  { city: "泸州", adcode: "510500", province: "四川", lng: 105.4425, lat: 28.8718, addr: "泸州市中心", letter: "L" },
  { city: "德阳", adcode: "510600", province: "四川", lng: 104.3980, lat: 31.1280, addr: "德阳市中心", letter: "D" },
  { city: "宜宾", adcode: "511500", province: "四川", lng: 104.6417, lat: 28.7513, addr: "宜宾市中心", letter: "Y" },
  { city: "宝鸡", adcode: "610300", province: "陕西", lng: 107.2370, lat: 34.3628, addr: "宝鸡市中心", letter: "B" },
  { city: "咸阳", adcode: "610400", province: "陕西", lng: 108.7050, lat: 34.3296, addr: "咸阳市中心", letter: "X" },
  { city: "渭南", adcode: "610500", province: "陕西", lng: 109.5028, lat: 34.4994, addr: "渭南市中心", letter: "W" },
  { city: "鞍山", adcode: "210300", province: "辽宁", lng: 122.9942, lat: 41.1086, addr: "鞍山市中心", letter: "A" },
  { city: "抚顺", adcode: "210400", province: "辽宁", lng: 123.9572, lat: 41.8807, addr: "抚顺市中心", letter: "F" },
  { city: "锦州", adcode: "210700", province: "辽宁", lng: 121.1268, lat: 41.0954, addr: "锦州市中心", letter: "J" },
  { city: "营口", adcode: "210800", province: "辽宁", lng: 122.2352, lat: 40.6675, addr: "营口市中心", letter: "Y" },
  { city: "盘锦", adcode: "211100", province: "辽宁", lng: 122.0696, lat: 41.1240, addr: "盘锦市中心", letter: "P" },
  { city: "吉林", adcode: "220200", province: "吉林", lng: 126.5493, lat: 43.8377, addr: "吉林市中心", letter: "J" },
  { city: "通化", adcode: "220500", province: "吉林", lng: 125.9397, lat: 41.7278, addr: "通化市中心", letter: "T" },
  { city: "延边", adcode: "222400", province: "吉林", lng: 129.5132, lat: 42.8917, addr: "延边市中心", letter: "Y" },
  { city: "齐齐哈尔", adcode: "230200", province: "黑龙江", lng: 123.9182, lat: 47.3543, addr: "齐齐哈尔市中心", letter: "Q" },
  { city: "大庆", adcode: "230600", province: "黑龙江", lng: 125.1038, lat: 46.5883, addr: "大庆市中心", letter: "D" },
  { city: "牡丹江", adcode: "231000", province: "黑龙江", lng: 129.6332, lat: 44.5518, addr: "牡丹江市中心", letter: "M" },
  { city: "佳木斯", adcode: "230800", province: "黑龙江", lng: 130.3176, lat: 46.7996, addr: "佳木斯市中心", letter: "J" },
  { city: "芜湖", adcode: "340200", province: "安徽", lng: 118.3763, lat: 31.3263, addr: "芜湖市中心", letter: "W" },
  { city: "蚌埠", adcode: "340300", province: "安徽", lng: 117.3893, lat: 32.9165, addr: "蚌埠市中心", letter: "B" },
  { city: "阜阳", adcode: "341200", province: "安徽", lng: 115.8209, lat: 32.8913, addr: "阜阳市中心", letter: "F" },
  { city: "安庆", adcode: "340800", province: "安徽", lng: 117.0635, lat: 30.5430, addr: "安庆市中心", letter: "A" },
  { city: "马鞍山", adcode: "340500", province: "安徽", lng: 118.5070, lat: 31.6900, addr: "马鞍山市中心", letter: "M" },
  { city: "宿州", adcode: "341300", province: "安徽", lng: 116.9642, lat: 33.6462, addr: "宿州市中心", letter: "S" },
  { city: "六安", adcode: "341500", province: "安徽", lng: 116.5231, lat: 31.7346, addr: "六安市中心", letter: "L" },
  { city: "台州", adcode: "331000", province: "浙江", lng: 121.4286, lat: 28.6556, addr: "台州市中心", letter: "T" },
  { city: "绍兴", adcode: "330600", province: "浙江", lng: 120.5802, lat: 30.0300, addr: "绍兴市中心", letter: "S" },
  { city: "嘉兴", adcode: "330400", province: "浙江", lng: 120.7550, lat: 30.7462, addr: "嘉兴市中心", letter: "J" },
  { city: "金华", adcode: "330700", province: "浙江", lng: 119.6471, lat: 29.0786, addr: "金华市中心", letter: "J" },
  { city: "丽水", adcode: "331100", province: "浙江", lng: 119.9229, lat: 28.4517, addr: "丽水市中心", letter: "L" },
  { city: "舟山", adcode: "330900", province: "浙江", lng: 122.1068, lat: 30.0161, addr: "舟山市中心", letter: "Z" },
  { city: "湖州", adcode: "330500", province: "浙江", lng: 120.0942, lat: 30.8950, addr: "湖州市中心", letter: "H" },
  { city: "衡水", adcode: "131100", province: "河北", lng: 115.6654, lat: 37.7356, addr: "衡水市中心", letter: "H" },
  { city: "邢台", adcode: "130500", province: "河北", lng: 114.5046, lat: 37.0709, addr: "邢台市中心", letter: "X" },
  { city: "张家口", adcode: "130700", province: "河北", lng: 114.8870, lat: 40.8243, addr: "张家口市中心", letter: "Z" },
  { city: "承德", adcode: "130800", province: "河北", lng: 117.9391, lat: 40.9762, addr: "承德市中心", letter: "C" },
];

/**
 * 酒店首页「热门城市酒店」模块用：含经纬度，便于按 IP 定位结果就近匹配默认城市。
 * lng / lat 为城市中心点近似坐标。
 */
export interface HotelCity extends AirportCity {
  lng: number;
  lat: number;
}

export const POPULAR_HOTEL_CITIES: HotelCity[] = [
  { city: "北京", code: "BJS", province: "北京", airport: "首都/大兴国际机场", letter: "B", lng: 116.4074, lat: 39.9042 },
  { city: "上海", code: "SHA", province: "上海", airport: "虹桥/浦东国际机场", letter: "S", lng: 121.4737, lat: 31.2304 },
  { city: "广州", code: "CAN", province: "广东", airport: "白云国际机场", letter: "G", lng: 113.2644, lat: 23.1291 },
  { city: "深圳", code: "SZX", province: "广东", airport: "宝安国际机场", letter: "S", lng: 114.0579, lat: 22.5431 },
  { city: "成都", code: "CTU", province: "四川", airport: "天府/双流国际机场", letter: "C", lng: 104.0665, lat: 30.5728 },
  { city: "杭州", code: "HGH", province: "浙江", airport: "萧山国际机场", letter: "H", lng: 120.1486, lat: 30.2741 },
  { city: "武汉", code: "WUH", province: "湖北", airport: "天河国际机场", letter: "W", lng: 114.3055, lat: 30.5928 },
  { city: "西安", code: "XIY", province: "陕西", airport: "咸阳国际机场", letter: "X", lng: 108.9398, lat: 34.3416 },
  { city: "重庆", code: "CKG", province: "重庆", airport: "江北国际机场", letter: "C", lng: 106.5516, lat: 29.5630 },
  { city: "南京", code: "NKG", province: "江苏", airport: "禄口国际机场", letter: "N", lng: 118.7969, lat: 32.0603 },
  { city: "苏州", code: "SZV", province: "江苏", airport: "硕放国际机场", letter: "S", lng: 120.5853, lat: 31.2989 },
  { city: "天津", code: "TSN", province: "天津", airport: "滨海国际机场", letter: "T", lng: 117.1901, lat: 39.1252 },
  { city: "青岛", code: "TAO", province: "山东", airport: "胶东国际机场", letter: "Q", lng: 120.3826, lat: 36.0671 },
  { city: "长沙", code: "CSX", province: "湖南", airport: "黄花国际机场", letter: "C", lng: 112.9388, lat: 28.2278 },
  { city: "厦门", code: "XMN", province: "福建", airport: "高崎国际机场", letter: "X", lng: 118.0894, lat: 24.4798 },
  { city: "昆明", code: "KMG", province: "云南", airport: "长水国际机场", letter: "K", lng: 102.7123, lat: 25.0406 },
  { city: "三亚", code: "SYX", province: "海南", airport: "凤凰国际机场", letter: "S", lng: 109.5083, lat: 18.2473 },
  { city: "海口", code: "HAK", province: "海南", airport: "美兰国际机场", letter: "H", lng: 110.3312, lat: 20.0317 },
  { city: "大连", code: "DLC", province: "辽宁", airport: "周水子国际机场", letter: "D", lng: 121.6147, lat: 38.9142 },
  { city: "郑州", code: "CGO", province: "河南", airport: "新郑国际机场", letter: "Z", lng: 113.6253, lat: 34.7466 },
  { city: "济南", code: "TNA", province: "山东", airport: "遥墙国际机场", letter: "J", lng: 117.1205, lat: 36.6510 },
  { city: "福州", code: "FOC", province: "福建", airport: "长乐国际机场", letter: "F", lng: 119.2965, lat: 26.0745 },
  { city: "沈阳", code: "SHE", province: "辽宁", airport: "桃仙国际机场", letter: "S", lng: 123.4290, lat: 41.7968 },
  { city: "贵阳", code: "KWE", province: "贵州", airport: "龙洞堡国际机场", letter: "G", lng: 106.7135, lat: 26.5783 },
  { city: "南宁", code: "NNG", province: "广西", airport: "吴圩国际机场", letter: "N", lng: 108.3669, lat: 22.8170 },
  { city: "合肥", code: "HFE", province: "安徽", airport: "新桥国际机场", letter: "H", lng: 117.2272, lat: 31.8206 },
  { city: "宁波", code: "NGB", province: "浙江", airport: "栎社国际机场", letter: "N", lng: 121.5440, lat: 29.8292 },
  { city: "无锡", code: "WUX", province: "江苏", airport: "硕放国际机场", letter: "W", lng: 120.3119, lat: 31.4912 },
  { city: "珠海", code: "ZUH", province: "广东", airport: "金湾机场", letter: "Z", lng: 113.5767, lat: 22.2710 },
  { city: "温州", code: "WNZ", province: "浙江", airport: "龙湾国际机场", letter: "W", lng: 120.6992, lat: 27.9939 },
];

/**
 * 经纬度算距离（km），用扁平 Earth 余弦近似，对城市级匹配足够。
 */
export function distanceKm(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * 国内优质酒店品牌（首页底部品牌推荐用）。
 * name 用于展示与 filters.hotel_brand 查询，desc 为一句标签，
 * gradient 用于无 logo 时的品牌色块，icon 为示意字符。
 */
export interface HotelBrand {
  name: string;
  desc: string;
  gradient: string;
  icon: string;
}

export const POPULAR_HOTEL_BRANDS: HotelBrand[] = [
  { name: "锦江", desc: "国民酒店 · 全国千店", gradient: "from-red-500 to-rose-600", icon: "锦" },
  { name: "华住", desc: "汉庭 · 全季 · 桔子", gradient: "from-orange-500 to-amber-600", icon: "华" },
  { name: "如家", desc: "经济舒适 · 商旅首选", gradient: "from-blue-500 to-indigo-600", icon: "如" },
  { name: "首旅", desc: "建国 · 京伦 · 和苑", gradient: "from-emerald-500 to-teal-600", icon: "首" },
  { name: "维也纳", desc: "中端商务 · 美食好眠", gradient: "from-amber-500 to-yellow-600", icon: "维" },
  { name: "亚朵", desc: "人文阅读 · IP 联名", gradient: "from-fuchsia-500 to-pink-600", icon: "亚" },
  { name: "希尔顿", desc: "国际豪华 · 荣誉客会", gradient: "from-sky-500 to-blue-700", icon: "希" },
  { name: "万豪", desc: "万豪 · JW · 丽思卡尔顿", gradient: "from-slate-700 to-neutral-900", icon: "万" },
];
