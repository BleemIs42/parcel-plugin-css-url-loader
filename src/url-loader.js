const CSSAsset = require('parcel-bundler/src/assets/CSSAsset')

class UrlLoaderAsset extends CSSAsset {
    constructor(name, options) {
      super(name, options)
      this.type = 'css'
      this.previousSourceMap = this.options.rendition
        ? this.options.rendition.map
        : null
    }
    async generate(){
        console.log(333)
    }
    async transform(){
        console.log(22223232332)
    }
}

module.exports = UrlLoaderAsset