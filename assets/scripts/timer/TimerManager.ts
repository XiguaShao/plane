import { Timer } from "./Timer";

/**
 * 定时器管理类（单例模式）
 */
export class TimerManager {
    private static _instance: TimerManager;
    private _timers: Map<number, Timer> = new Map();
    private _idCounter: number = 0;

    static get instance(): TimerManager {
        return this._instance || (this._instance = new TimerManager());
    }

    addTimer(callback: () => void, delay: number): number {
        const id = ++this._idCounter;
        const timer = new Timer(id, callback, delay);
        this._timers.set(id, timer);
        timer.start();
        return id;
    }

    removeTimer(id: number): void {
        const timer = this._timers.get(id);
        if (timer) {
            timer.clear();
            this._timers.delete(id);
        }
    }

    // 添加暂停时保留剩余时间的功能
    pauseTimer(id: number) {
        const timer = this._timers.get(id);
        if (timer) timer.pause();
    }

    resumeTimer(id: number) {
        const timer = this._timers.get(id);
        if (timer) timer.resume();
    }

    pauseAll(): void {
        this._timers.forEach(timer => timer.pause());
    }

    resumeAll(): void {
        this._timers.forEach(timer => timer.resume());
    }

    clearAll(): void {
        this._timers.forEach(timer => timer.clear());
        this._timers.clear();
    }

}