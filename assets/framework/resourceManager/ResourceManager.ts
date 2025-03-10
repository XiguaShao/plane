import Singleton from '../utils/Singleton';
import CacheAssetManager from './CacheAssetManager';
import ResLoader from './ResLoader';

export default class ResourceManager extends Singleton {
	
	private _assetsReloadMap: Map<string, number> = new Map<string, number>();
	private _resourceMaps: any = {};
	/**
     * 加载过的资源地址,远端 & 本地路径
     */
	private _loadUrls: string[] = [];
	private _finish: number;
	private _onResListComplete: Function;
	private _onResListProgress: Function;

	onInitInstance() {
		this._assetsReloadMap = new Map<string, number>();
	}

	onDestroyInstance() {
		this.clearAssets();
	}

	/**
     * 通用资源加载接口（包括本地资源、网络资源和远程资源）
     * @param {string} path 资源路径，可以是本地资源、网络资源和远程资源
     * @param {cc.Asset | Record<string, any>} options 资源类型 | 远程资源可选参数
     * @param {(err, res) => void} onComplete 加载完成回调
     * @param {cc.AssetManager.Bundle | string} bundle 资源所属bundle，可选。
     * @param {(finish: number, total: number, item: cc.AssetManager.RequestItem) => void} onProgress 加载进度
     */
	loadRes(
		path: string,
		options: typeof cc.Asset | Record<string, any>,
		onComplete: (err, res: any) => void,
		bundle?: cc.AssetManager.Bundle | string,
		onProgress?: (
        finish: number,
            total: number,
            item: cc.AssetManager.RequestItem
        ) => void
	) {
		let asset = this.getAsset(path);
		if (asset) {
			onComplete(null, asset);
			this._loadUrls.push(path);
			CacheAssetManager.ins().setAsset(path, asset);
			return;
		}
		let complete = (err, res: cc.Asset) => {
			onComplete(err, res);
			this.addLocalRes2ResourceMaps(path, res.nativeUrl);
			if (!(res instanceof cc.Prefab)) {
				this._loadUrls.push(path);
				CacheAssetManager.ins().setAsset(path, res);
			}
		};
		ResLoader.loadRes(path, options, complete, bundle, onProgress);
	}

	/**
	 * 加载一个资源列表
	 * @param dir 目录
	 * @param options 
	 * @param onComplete 
	 * @param onProgress 
	 */
	loadDir(dir: string, onComplete: () => void, onProgress?: (finish: number, total: number) => void) {
		let list = this.getResourceList(dir);
		this.loadResourceList(list, onComplete, onProgress);
	}

	/**
	 * 加载资源列表
	 * @param dirs 目录列表
	 * @param options 
	 * @param onComplete 
	 * @param onProgress 
	 */
	loadDirs(dirs: string[], onComplete: () => void, onProgress?: (finish: number, total: number) => void) {
		let list = [];
		dirs.forEach(v => {
			let arr = this.getResourceList(v);
			list.push(...arr);
		});
		this.loadResourceList(list, onComplete, onProgress);
	}

	/**
     * 
     * @param nameOrUrl 
     * @param options 
     * @param onComplete 
     * @returns 
     */
	loadBundle(
		nameOrUrl: string,
		options: Record<string, any>,
		onComplete: (err: Error, bundle: cc.AssetManager.Bundle) => void
	): void {
		ResLoader.loadBundle(nameOrUrl, options, onComplete);
	}

	clearAssets() {
		CacheAssetManager.ins().releasingResourceList(this._loadUrls);
	}
	/**
     * 增加资源加载接口
     * @param url 资源地址
     * @param type 资源类型
     * @param onComplete 加载成功回调
     */
	public loadRemote(url: string, type: typeof cc.Asset, onComplete: (err, res) => void) {
		let asset = this.getAsset(url);
		if (asset) {
			onComplete(null, asset);
			return;
		}
		ResLoader.loadRes(url, null, (e, a) => {
			if (e) {
				console.error(url, e);
				onComplete(e, null);
			} else {
				this._loadUrls.push(url);
				CacheAssetManager.ins().setAsset(url, asset);
				onComplete(e, a);
			}
		});
	}

	getAsset<T>(url: string) {
		const asset = CacheAssetManager.ins().getAsset(url);
		//@ts-ignore
		return <T>asset;
	}

	getJson<T>(url: string) {
		const asset = CacheAssetManager.ins().getAsset(url) as cc.JsonAsset;
		return asset.json as T;
	}

	getJsonById<T>(url: string, key: number | string) {
		const asset = CacheAssetManager.ins().getAsset(url) as cc.JsonAsset;
		return asset.json[key.toString()] as T;
	}

	public async getTexture(path: string): Promise<cc.SpriteFrame>  {
		return new Promise((resolve, reject) => {
			this.loadRes(path, cc.SpriteFrame, (error, spriteFrame: cc.SpriteFrame)=>{
				if (error) {
					reject(error);
				} else {
					resolve(spriteFrame)
				}
			})
		})
	}

	public async getPrefab(path: string): Promise<cc.Prefab>  {
		return new Promise((resolve, reject) => {
			this.loadRes(path, cc.Prefab, (error, spriteFrame: cc.Prefab)=>{
				if (error) {
					reject(error);
				} else {
					resolve(spriteFrame)
				}
			})
		})
	}

	getResourceList(dir: string): string[] {
		let assets = cc.resources.getDirWithPath(dir, cc.Asset);
		let list = [];
		assets.forEach(v => {
			list.push(v.path);
		});
		return list;
	}

	loadResourceList(urls: string[], onComplete: () => void, onProgress: (finish: number, total: number) => void) {
		this._loadUrls = urls;
		this._onResListComplete = onComplete;
		this._onResListProgress = onProgress;
		this._finish = 0;
		if (urls.length > 0) {
			urls.map((url) => {
				this._assetsReloadMap.set(url, 0);
				this.loadResource(url);
			});
		} else {
			this.loadResEnd();
		}
	}

	/**
     * 资源下载回调,当下载表和资源表长度相同时,回调QteSystem
     */
	private loadResEnd(): void {
		for (let i = 0; i < this._loadUrls.length; i++) {
			if (!CacheAssetManager.ins().getAsset(this._loadUrls[i])) {
				this._finish++;
				this._onResListProgress && this._onResListProgress(this._finish, this._loadUrls.length);
				return;
			}
		}
		if (this._onResListComplete) {
			this._onResListComplete();
			this._onResListComplete = null;
		}
	}

	getName(requestUrl) {
		let names = requestUrl.split('/');
		let name = names[names.length - 1].split('.');
		return name[0];
	}

	private loadResource(url) {
		let requestUrl = this.transRequestUrl(url);
		const cachedAsset = CacheAssetManager.ins().getAsset(requestUrl);
		if (cachedAsset) {
			CacheAssetManager.ins().setAsset(url, cachedAsset);
			this.loadResEnd();
			return;
		}

		ResLoader.loadRes(
			requestUrl,
			null,
			(err, asset) => {
				if (err) {
					let dataReloadCount = this._assetsReloadMap.get(url);
					if (dataReloadCount < 2) {
						this._assetsReloadMap.set(url, dataReloadCount + 1);
						return this.loadResource(url);
					} else {
						CacheAssetManager.ins().setAsset(url, {});
						this.loadResEnd();
					}
				} else {
					CacheAssetManager.ins().setAsset(url, asset);
					this.loadResEnd();
				}
			}
		);
	}

	private transRequestUrl(url): string {
		if (this._resourceMaps[url]) {
			return this._resourceMaps[url];
		}
		return url;
	}

	private addLocalRes2ResourceMaps(path: string, nativeUrl:string) {
		if (this._resourceMaps) {
			this._resourceMaps[path] = nativeUrl;
		}
	}
}
