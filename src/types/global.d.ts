interface anyObj {
  [key: string]: any
}

interface TagsItem {
  [key: string]: string | number | boolean | any
}

interface PageData {
  page?: number,
  limit?: number,
  total?: number
}

interface LoginInfo {
  account?: string
  pwd?: string
  wxCode?: string
}

interface CategoryProps {
  cid?: number | string
	flag?: boolean
	imageLink?: string
	name?: string
	parentId?: number | string
	path?: string
	status?: number | boolean
  appPath?: string
  sort?: number
  createTime?: string
  updateTime?: string
}

interface ProductProps {
  cid?: string | number
  prodId?: string | number
  prodCode?: string
  prodName?: string
  flatPattern?: string
  flag?: boolean
  sort?: number
  vip?: boolean
  createTime?: string
  updateTime?: string
}

interface ProductDetail {
  colors?: anyObj[]
  detailId?: string | number
  detailText?: string
  flatPattern?: string
  norms?: anyObj[]
  price?: string | number
  prodCode?: string | number
  prodName?: string
  prodInfo?: string
  sliderImage?: string[]
  unit?: string
  videoLink?: string
  vip?: boolean
}

interface AlbumProps {
  albumId?: string | number
  albumName?: string
  pdfLink?: string
  flatPattern?: string
  sort?: number
  vip?: boolean
  createTime?: string
  updateTime?: string
}

interface VideoProps {
  cid?: string | number
  categoryName?: string
  videoId?: string | number
  headline?: number
  flag?: boolean
  createTime?: string
  updateTime?: string
  videoLink?: string
  imageLink?: string
  flatPattern?: string
  vip?: boolean
}


interface installationsProps {
  cid?: string | number
  categoryName?: string
  installExplainId?: number | string
  installExplainName?: string
  flatPattern?: string
  images?: anyObj[]
  videos?: string[]
  sort?: number
  flag?: boolean
  vip?: boolean
  page?: number
  limit?: number
  createTime?: string
  updateTime?: string
}

interface ArticleProps {
  cid?: string | number
  categoryName?: string
  articleId?: string | number
  title?: string
  author?: string
  flatPattern?: string
  content?: string
  synopsis?: string
  status?: boolean | number
  type?: string | number
  sort?: number
  flag?: boolean
  shareTitle?: string
  shareSynopsis?: string
  creatorId?: string | number
  modifierId?: string | number
  originalUrl?: string
  vip?: boolean
  page?: number
  limit?: number
  createTime?: string
  updateTime?: string
}

interface OpertionLog {
  id?: string | number
  adminAccount?: string
  adminName?: string
  operationIp?: string
  operationModule?: string
  operationType?: string | number
  operationResult?: string
  operationParam?: string
  operationTime?: string
}

interface UserProps {
  userId?: string
  account?: string
  nickname?: string
  avatar?: string
  sex?: number
  status?: boolean
  email?: string
  lastIp?: string
  createTime?: string
  updateTime?: string
  level?: number
  phone?: string
  realName?: string,
  id?: string
  vip?: string
}

interface AppletInfo {
  dataId?: number | string
  flag?: boolean
  flatPattern?: string
  telNum?: string
  faxNum?: string
  qqNum?: string
  vxNum?: string
  email?: string
  qrCodeLink?: string
  createTime?: string
  updateTime?: string
}
