class Camera{
    constructor(){
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);
    }

    forward(){
        var d = this.at.sub(this.eye);
        d.normalize();
        f.mul(0.1);
        this.at.add(d);
        this.eye.add(d);
    }


    backward(){
        var f = this.eye.sub(this.at);
        f.normalize();
        f.mul(0.1);
        this.at.add(f);
        this.eye.add(f);
    }


    left(){
        var f = this.eye.sub(this.at);
        var s = Vector3.cross(this.up,f);
        s.normalize();
        s.mul(0.1);
        this.at.add(s);
        this.eye.add(s);
    }

    right(){
        var f = this.at.sub(this.eye);
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(0.1);
        this.at.add(s);
        this.eye.add(s);
    }
}