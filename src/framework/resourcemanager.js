import io from './io.js';

export default function(gl) {
    var resources = {};
    var releaseList = [];
    
    var total = 0;
    var loaded = 0;
    
    this.load = function(factory, name, config) {
        var resource = resources[name];
        if(resource) {
            return resource;
        }
        resource = factory(name, gl, config);
        if(resource.then !== undefined) {
            total += 1;
            resource.then(function() {
                loaded += 1;
            }, function(err) {
                io.error("Loading resource '" + name + "' failed:\n" + err);
            });
        }
        resources[name] = resource;
        return resource;
    };
    this.add = function(res) {
        releaseList.push(res);
    };
    
    this.isLoading = function() { return total > loaded; };
    this.progress = function() {
        if(total === 0) {
            return 1;
        }
        return loaded / total;
    };
    
    function release(res) {
        if(res.release) {
            res.release();
        } else if(res.then) {
            res.then(function(res) {
                if(res.release) {
                    res.release();
                }
            });
        }
    }
    
    this.release = function() {
        for(var name in resources) {
            release(resources[name]);
        }
        releaseList.forEach(release);
        resources = {};
        releaseList = [];
    };
};
