const { readFileSync, statSync, existsSync } = require('fs')
const mime = require('mime')
const CSSAsset = require(`parcel-bundler/${parseInt(process.versions.node, 10) < 8 ? 'lib' : 'src'}/assets/CSSAsset`)
const { dirname, join, resolve, extname, normalize, relative, basename } = require('path')

const projectRootPath = resolve(__dirname, '../../../')
const parcelrcPath = join(projectRootPath, '.parcelrc')
const getConfig = () => existsSync(parcelrcPath) ? JSON.parse(readFileSync(parcelrcPath))['css-url-loader'] : {} 

const EXTS = ['png', 'svg', 'jpg', 'gif', 'jpeg']
const LIMIT = 10240

const cache = new Map()

class UrlLoaderAsset extends CSSAsset {
    constructor(name, options) {
        super(name, options)
        this.type = 'css'
        this.previousSourceMap = this.options.rendition
            ? this.options.rendition.map
            : null
    }
    async postProcess(generated){
        const css = generated.find(e => e.type === 'css')
        if(css){
            this.pluginConfig = this.pluginConfig || getConfig()
            const { exts = EXTS, limit = LIMIT } = this.pluginConfig
            
            this.dependencies.forEach((val, key) => {
                const { name, resolved } = val
                const imagePath = join(dirname(this.name), name)

                const type = extname(imagePath).substr(1)
                if(!exts.includes(type)) return 
    
                const fileStat = statSync(imagePath)
                if(fileStat.size / 1024 > limit) return
                
                const hashname = this.generateBundleName.call({
                    relativeName: relative(this.options.rootDir, imagePath).replace(/\\/g, '/'),
                    type
                })

                let base64str = ''
                if(cache.has(hashname)){
                    base64str = cache.get(hashname)
                }else{
                    const data = readFileSync(imagePath)
                    const filemime = mime.getType(imagePath)
                    base64str = `data:${filemime};base64,${data.toString('base64')}`
                }

                const regexp = new RegExp(`(${this.options.publicURL})?${hashname}`, 'g')
                css.value = css.value.replace(regexp, base64str)

                cache.set(hashname, base64str)
                this.dependencies.delete(`./${normalize(name)}`)
            })
        }
        return generated
    }
}

module.exports = UrlLoaderAsset