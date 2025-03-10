export enum UrlType {
    NET = 'net',
    LOCAL = 'local',
    FILE = 'file',
}

export function getUrlType(url: string=''): UrlType {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return UrlType.NET;
	} else if (url.startsWith('file')) {
		return UrlType.FILE;
	} else if (url.startsWith('assets')) {
		return UrlType.FILE;
	} else {
		return UrlType.LOCAL;
	}
}

const ImageFormats = [
	'.png',
	'.jpg',
	'.bmp',
	'.jpeg',
	'.gif',
	'.ico',
	'.tiff',
	'.webp',
	'.image',
	'.pvr',
	'.pkm'
];
const AudioFormats = ['.mp3', '.ogg', '.wav', '.m4a'];

function getExt(s: string) {
	const sArray = s.split('.');
	const length = sArray.length;

	return length > 1 ? `.${sArray[length - 1]}` : '';
}

//获取资源类型
export function getResourceClassType(url) {
	const ext = getExt(url);
	if (ImageFormats.includes(ext)) {
		return cc.SpriteFrame;
	}
	if (AudioFormats.includes(ext)) {
		return cc.AudioClip;
	}
}
