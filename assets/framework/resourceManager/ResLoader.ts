import { LoaderObserver, LoaderObserverParam } from './LoaderObserver';
import { getUrlType, UrlType } from './LoaderUtil';

/**
 * 资源加载器
 * 提供各种资源类型加载接口，包括自定义加载器，注册加载观察者等。
 */
export default class ResLoader {
	// 加载器观察者列表
	private static _observerList: LoaderObserver[] = [];

	/**
     * 注册观察者
     * @param {LoaderObserver} observer 自定义观察者
     */
	public static addObserver(observer: LoaderObserver): void {
		ResLoader._observerList.push(observer);
	}

	/**
     * 通用资源加载接口（包括本地资源、网络资源和远程资源）
     * @param {string} path 资源路径，可以是本地资源、网络资源和远程资源
     * @param {cc.Asset | Record<string, any>} options 资源类型 | 远程资源可选参数
     * @param {(err, res) => void} onComplete 加载完成回调
     * @param {cc.AssetManager.Bundle | string} bundle 资源所属bundle，可选。
     * @param {(finish: number, total: number, item: cc.AssetManager.RequestItem) => void} onProgress 加载进度
     */
	public static async loadRes(
		path: string,
		options: typeof cc.Asset | Record<string, any>,
		onComplete: (err, res: any) => void,
		bundle?: cc.AssetManager.Bundle | string,
		onProgress?: (
            finish: number,
            total: number,
            item: cc.AssetManager.RequestItem
        ) => void
	): Promise<void> {
		let curBundle: cc.AssetManager.Bundle = null;
		let tempType = null;
		if (typeof options !== 'object') {
			tempType = options;
			if (bundle && typeof bundle === 'string' && bundle !== '') {
				curBundle = cc.assetManager.getBundle(bundle);
			} else if (bundle && typeof bundle !== 'string') {
				curBundle = bundle as cc.AssetManager.Bundle;
			}
			if (curBundle) {
				let as = curBundle.get(path, tempType);
				if (as) {
					ResLoader.__beforeLoadRes(new LoaderObserverParam(path, tempType, curBundle, 0, null));
					onComplete(null, as);
					ResLoader.__afterLoadRes(new LoaderObserverParam(path, tempType, curBundle, 0, null));
					return;
				}
			}
		}
		let param = new LoaderObserverParam(path, tempType, curBundle, 0, null);
		ResLoader.__beforeLoadRes(param);
		let startTime = new Date().getTime();
		const urlType = getUrlType(path);
		switch (urlType) {
		case UrlType.LOCAL:
			ResLoader.loadLocalRes(path, options, onProgress, (_err, _res) => {
				if (onComplete) {
					param.time = new Date().getTime() - startTime; // 计算下载时间
					ResLoader.__afterLoadRes(param);
					onComplete(_err, _res);
				}
			}, curBundle);
			break;
		case UrlType.FILE:
		case UrlType.NET:
			ResLoader.loadRemoteRes(path, options, (_err, _res) => {
				if (onComplete) {
					param.time = new Date().getTime() - startTime; // 计算下载时间
					ResLoader.__afterLoadRes(param);
					onComplete(_err, _res);
				}
			});
			break;
		}
	}

	/**
     * 加载目录
     * @param {string} dir 资源目录
     * @param {cc.Asset} type 资源类型
     * @param {(finish: number, total: number, item: cc.AssetManager.RequestItem) => void} onProgress 加载进度回调
     * @param {(error: Error, assets: Array<T>) => void} onComplete 加载完成回调
     * @param {cc.AssetManager.Bundle | string} bundle 资源所属bundle，可选。
     */
	public static loadDir<T extends cc.Asset>(
		dir: string,
		type: typeof cc.Asset,
		onProgress: (
            finish: number,
            total: number,
            item: cc.AssetManager.RequestItem
        ) => void,
		onComplete: (error: Error, assets: Array<T>) => void,
		bundle?: cc.AssetManager.Bundle | string
	): void {
		let curBundle: cc.AssetManager.Bundle = null;
		if (bundle && typeof bundle === 'string' && bundle !== '') {
			curBundle = cc.assetManager.getBundle(bundle);
		} else if (bundle && typeof bundle !== 'string') {
			curBundle = bundle as cc.AssetManager.Bundle;
		} else {
			curBundle = cc.resources as cc.AssetManager.Bundle;
		}
		if (!curBundle) {
			onComplete(new Error(`bundle ${bundle} is not exists!`), null);
			return;
		}
		curBundle.loadDir(dir, type, onProgress, onComplete);
	}

	/**
     * 加载bundle
     * @param {string} nameOrUrl bundle名称或地址
     * @param {Record<string, any>} options 下载bundle的可选参数
     * @param {(err: Error, bundle: cc.AssetManager.Bundle) => void} onComplete 加载完成回调
     */
	public static loadBundle(
		nameOrUrl: string,
		options: Record<string, any>,
		onComplete: (err: Error, bundle: cc.AssetManager.Bundle) => void
	): Promise<cc.AssetManager.Bundle> {
		return new Promise((resolve, reject) => {
			let param = new LoaderObserverParam(nameOrUrl, null, null, 0, null);
			let startTime = new Date().getTime();
			ResLoader.__beforeLoadBundle(param);
			const exist = cc.assetManager.bundles.find((_bundle, b) => {
				return (_bundle.base.indexOf(nameOrUrl) !== -1 || _bundle.name === nameOrUrl);
			});
			if (exist) {
				param.time = new Date().getTime() - startTime; // 加载时间处理
				ResLoader.__afterLoadBundle(param);
				if (onComplete) {
					onComplete(null, exist);
				}
				resolve(exist);
				return;
			}
			cc.assetManager.loadBundle(nameOrUrl, options, (_err, _bundle) => {
				param.time = new Date().getTime() - startTime; // 加载时间处理
				ResLoader.__afterLoadBundle(param);
				if (onComplete) {
					onComplete(_err, _bundle);
				}
				resolve(_bundle);
			});
		});
	}
	/**
     * 加载远程资源
     * @param path
     * @param type
     * @param callback
     * @returns
     */
	public static loadRemoteRes(
		path: string,
		type:  any,
		callback: (err: any, res: any) => void
	) : Promise<cc.Asset>{
		return new Promise<cc.Asset>((resolve, reject) => {
			// 加载网络json资源
			cc.assetManager.loadRemote(path, type, (e, res) => {
				if (e) {
					console.error(e);
					reject(e);
				} else {
					resolve(res);
				}
				if (callback) {
					callback(e, res);
				}
			});
		});
	}
	/**
     * 加载resouces 或者bundle 内资源
     * @param path
     * @param type
     * @param onProgress
     * @param callback
     * @param bundle
     * @returns
     */
	public static loadLocalRes(
		path: string,
		type: any,
		onProgress: (
            finish: number,
            total: number,
            item: cc.AssetManager.RequestItem
        ) => void,
		callback: (err: any, res: any) => void,
		bundle?: cc.AssetManager.Bundle
	) {
		return new Promise((resolve, reject) => {
			if (bundle) {
				bundle.load(path, type, onProgress, (e, res) => {
					if (e) {
						console.error(e);
						reject(e);
					} else {
						resolve(res);
					}
					if (callback) {
						callback(e, res);
					}
				});
			} else {
				cc.loader.loadRes(path, type, (e, res) => {
					if (e) {
						console.error(e);
						reject(e);
					} else {
						resolve(res);
					}
					if (callback) {
						callback(e, res);
					}
				});
			}
		});
	}

	private static __beforeLoadRes(param: LoaderObserverParam): void {
		for (let obs of ResLoader._observerList) {
			obs.beforeLoadRes(param);
		}
	}

	private static __afterLoadRes(param: LoaderObserverParam): void {
		for (let obs of ResLoader._observerList) {
			obs.afterLoadRes(param);
		}
	}

	private static __beforeLoadBundle(param: LoaderObserverParam): void {
		for (let obs of ResLoader._observerList) {
			obs.beforeLoadBundle(param);
		}
	}

	private static __afterLoadBundle(param: LoaderObserverParam): void {
		for (let obs of ResLoader._observerList) {
			obs.afterLoadBundle(param);
		}
	}

	/**
     * 移除观察者
     * @param {LoaderObserver} observer 自定义观察者
     * @returns {boolean} 是否移除成功
     */
	public static removeObserver(observer: LoaderObserver): boolean {
		for (let i = ResLoader._observerList.length - 1; i >= 0; i--) {
			let obs = ResLoader._observerList[i];
			if (obs === observer) {
				ResLoader._observerList.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	/**
     * 直接通过asset释放资源（如cc.Prefab、cc.SpriteFrame）
     * @param asset 要释放的asset
     */
	public static releaseAsset(asset: cc.Asset) {
		asset.decRef();
	}
}