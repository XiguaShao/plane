import { TimerManager } from "./TimerManager";

export class Timer {
    private _remaining: number;
    private _paused: boolean = false;
    private _startTime: number;
    private _timeoutId: number;

    constructor(
        public readonly id: number,
        private readonly _callback: () => void,
        private _delay: number
    ) {}

    start(): void {
        this._startTime = Date.now();
        this._timeoutId = setTimeout(() => this._execute(), this._delay);
    }

    pause(): void {
        if (this._paused) return;
        this._remaining = this._delay - (Date.now() - this._startTime);
        clearTimeout(this._timeoutId);
        this._paused = true;
    }

    resume(): void {
        if (!this._paused) return;
        this._delay = this._remaining;
        this._startTime = Date.now();
        this._timeoutId = setTimeout(() => this._execute(), this._remaining);
        this._paused = false;
    }

    clear(): void {
        clearTimeout(this._timeoutId);
        this._paused = true;
    }

    private _execute(): void {
        if (this._paused) return;
        this._callback();
        TimerManager.instance.removeTimer(this.id);
    }
}