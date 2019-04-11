const { readFileSync, statSync, existsSync } = require('fs')
const mime = require('mime')
const CSSAsset = require('parcel-bundler/src/assets/CSSAsset')
const { dirname, join, resolve, extname, normalize } = require('path')

const projectRootPath = resolve(__dirname, '../../../')
const parcelrcPath = join(projectRootPath, '.parcelrc')
const getConfig = () => existsSync(parcelrcPath) ? JSON.parse(readFileSync(parcelrcPath)).url2base64 : {} 

const EXTS = ['png', 'svg', 'jpg', 'gif']
const LIMIT = 1000

class UrlLoaderAsset extends CSSAsset {
    constructor(name, options) {
      super(name, options)
      this.type = 'css'
      this.previousSourceMap = this.options.rendition
        ? this.options.rendition.map
        : null
    }
    async load(){
        this.pluginConfig = this.pluginConfig || getConfig()
        const { exts = EXTS, limit = LIMIT } = this.pluginConfig

        const dir = dirname(this.name)
        let content = readFileSync(this.name, this.encoding).toString()

        // normalize('./..images/logo') => '..images/logo'
        let urlMap = (content.match(/url\((\S+)\)/g) || [])
                        .map(url => url.replace(/url|\(|\)|"|'/g, ''))
                        .filter(url => !url.includes('data:'))
                        .map(normalize)
        this.replacedMap = []
        urlMap = new Set(urlMap)
        urlMap.forEach(url => {
            const filePath = join(dir, url)

            const extName = extname(filePath).substr(1)
            if(!exts.includes(extName)) return 

            const fileStat = statSync(filePath)
            if(fileStat.size / 1024 > limit) return 

            this.replacedMap.push(url)
            const data = existsSync(filePath) ? readFileSync(filePath) : ''
            const filemime = mime.getType(filePath)
            content = content.replace(url, `data:${filemime};base64,${data.toString('base64')}`)
        })
        return Promise.resolve(content)
    }
    async generate() {
        this.replacedMap.forEach(url => {
            // Path such as ../image/logo and ./../image/logo are the same path, 
            // they are resolved as ./../image/logo in dependencies
            this.dependencies.delete(url)
            this.dependencies.delete(`./${url}`)
        })
        return await super.generate()
    }
}

module.exports = UrlLoaderAsset