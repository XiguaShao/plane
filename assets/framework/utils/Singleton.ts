export default class Singleton {
    public static ins<T extends Singleton>(this: new () => T): T {
        if(!(<any>this).instance){
            (<any>this).instance = new this();
        }
        return (<any>this).instance;
    }
}