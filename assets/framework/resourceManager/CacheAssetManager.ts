import Singleton from "../utils/Singleton";

/**
 * cocos缓存数据
 */
 interface cacheAsset {
    count: number,
    asset: cc.Asset
}

/**
 * 缓存管理类
 */
export default class CacheAssetManager extends Singleton {
	/**
     * 缓存列表
     */
	private cachedAssets: Map<string, cacheAsset> = new Map<string, cacheAsset>();
	/**
     * load之后,
     * @param url 
     * @param asset 
     */
	setAsset(url: string, asset: any) {
		const cachedAsset = this.cachedAssets.get(url);
		if (cachedAsset) {
			this.cachedAssets.set(url, {count: cachedAsset.count + 1, asset: cachedAsset.asset});
		} else {
			this.cachedAssets.set(url, { count: 1, asset: asset});
		}
	}

	/**
     * 
     * @param url 
     * @returns 
     */
	getAsset(url: string): cc.Asset | undefined {
		const cachedAsset = this.cachedAssets.get(url);
		return cachedAsset ? cachedAsset.asset : undefined;
	}

	getAssetsCache() {
		return this.cachedAssets;
	}

	/**
     * 析构
     * @param url 
     * @returns 
     */
	releasingAsset(url: string) {
		const cachedAsset = this.cachedAssets.get(url);
		if (!cachedAsset) {
			return;
		}
		if (cachedAsset.count > 1) {
			this.cachedAssets.set(url, {count: cachedAsset.count - 1, asset: cachedAsset.asset});
		} else {
			this.cachedAssets.delete(url);
			cc.assetManager.releaseAsset(cachedAsset.asset);
		}
	}

	/**
     * 释放这一批urls的资源
     * @param urls 
     */
	releasingResourceList(urls: string[]) {
		urls.forEach(url => {
			this.releasingAsset(url);
		});
	}
}
