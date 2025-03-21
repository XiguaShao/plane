import * as _ from 'lodash';
import Weapon from './Weapon';
import { WeaponCfg } from '../common/JsonConfig';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpinWeapon extends Weapon {
    @property
    spinMin: number = -45;

    @property
    spinMax: number = 45;

    @property
    spinSpeed: number = 1000;

    private _flag: number = 1;

    start(): void {
        super.start();
        this.rotation = this.spinMin;
        this._flag = 1;
    }

    update(dt: number): void {
        const value = dt * this.spinSpeed * this._flag;
        this.rotation = this.rotation + value;
        if (this.rotation > this.spinMax) {
            this.rotation = this.spinMax;
            this._flag = -1;
        } else if (this.rotation < this.spinMin) {
            this.rotation = this.spinMin;
            this._flag = 1;
        }
        //cc.log(this.rotation);
    }

    assignParam(weapon: SpinWeapon): void {
        super.assignParam(weapon);
        weapon.spinMax = this.spinMax;
        weapon.spinMin = this.spinMin;
        weapon.spinSpeed = this.spinSpeed;
    }

    initByCfg(cfg: WeaponCfg): void {
        super.initByCfg(cfg);
        
        this.spinMin = cfg.spinMin || -45;
        this.spinMax = cfg.spinMax || 45;
        this.spinSpeed = cfg.spinSpeed || 1000;
        this._flag = 1;
    }
}