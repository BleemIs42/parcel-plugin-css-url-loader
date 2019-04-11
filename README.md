# parcel-plugin-css-url-loader
> A plugin for parcel to convert css/less/scss url into base64

## Install 
```bash
yarn add parcel-plugin-css-url-loader --dev # or
npm install parcel-plugin-css-url-loader --save-dev
```

## Usage
```js
// .parcelrc
{
  "url2base64": {
    "exts": ['png', 'svg', 'jpg', 'gif'],
    "limit": 1000    //kb
  }
}

```