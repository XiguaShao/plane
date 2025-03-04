export const _decorator = {
    ccclass: (target: any) => target,
    property: (options?: any) => (target: any, key: string) => {
        let value = target[key];
        Object.defineProperty(target, key, {
            get: function() { return value; },
            set: function(newValue) { value = newValue; },
            enumerable: true,
            configurable: true
        });
    }
};

export class Component {
    constructor() {
        // Initialize component properties
        this.node = new CCNode();
        
        // Handle decorated properties
        const proto = Object.getPrototypeOf(this);
        Object.getOwnPropertyNames(proto).forEach(key => {
            if (key !== 'constructor') {
                Object.defineProperty(this, key, {
                    value: proto[key],
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }
        });
    }
    node: CCNode;
}

export class CCNode {
    position = { x: 0, y: 0, z: 0 };
    rotation = 0;
}

export const Node = CCNode;  // For backward compatibility

export const v2 = (x: number, y: number) => new Vec2(x, y);
export const v3 = (x: number, y: number, z: number = 0) => new Vec3(x, y, z);

export class Vec2 {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    x: number;
    y: number;
}

export class Vec3 {
    constructor(x: number, y: number, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    x: number;
    y: number;
    z: number;
    sub(v: Vec3) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}