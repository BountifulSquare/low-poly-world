import * as THREE from '../node_modules/three/build/three.module.js'

class Water {
    constructor(lightPosition, viewPosition) {
        this._lightPosition = lightPosition
        this._viewPosition = viewPosition

        this._geometry = this._createGeometry()
        this._material = this._createMaterial()
        this._mesh = new THREE.Mesh(this._geometry, this._material)
        this._mesh.position.set(-50, 120, 0)
    }

    _createGeometry() {
        const dimension = 350
        const segment = 30
        const geometry = new THREE.PlaneGeometry(dimension, dimension, segment, segment)
        geometry.rotateX(-Math.PI / 2)

        const angles = []
        const count = (segment + 1) * (segment + 1)
        for (let i = 0; i < count; i++) {
            angles.push(Math.random())
        }
        geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))

        return geometry
    }

    _createMaterial() {
        const lightPosition = this._lightPosition
        const lightColor = new THREE.Vector3(1, 1, 1)
        const viewPosition = this._viewPosition
        const uniforms = {
            u_time: { value: 0.0 },
            u_lightPosition: { value: lightPosition },
            u_lightColor: { value: lightColor },
            u_viewPosition: { value: viewPosition }
        }

        const vertexShader = `
            uniform float u_time;

            varying vec3 v_vtxViewSpace;
            varying vec3 v_normal;

            attribute float angle;

            void main() {
                vec3 transformed = position;
                float amplitude = 3.0;
                float period = (u_time + angle);
                float x = position.x;
                float z = position.z;

                transformed.y = amplitude * (sin(period + x) + cos(period + z));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
                v_vtxViewSpace = vec3(modelMatrix * vec4(transformed, 1.0));
                v_normal = normal;
            }
        `

        const fragmentShader = `
            uniform vec3 u_lightPosition;
            uniform vec3 u_lightColor;
            uniform vec3 u_viewPosition;

            varying vec3 v_vtxViewSpace;

            void main() {
                vec3 U = dFdx(v_vtxViewSpace);
                vec3 V = dFdy(v_vtxViewSpace);
                vec3 normal = normalize(cross(U, V));

                vec3 lightDirection = normalize(u_lightPosition - v_vtxViewSpace);
                float diff = max(dot(normal, lightDirection), 0.0);
                vec3 diffuse = diff * u_lightColor;

                float specularStrength = 0.5;
                vec3 viewDirection = normalize(u_viewPosition - v_vtxViewSpace);
                vec3 reflectDirection = reflect(-lightDirection, normal);
                float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 64.0);
                vec3 specular = specularStrength * spec * u_lightColor;

                vec3 color = (diffuse + specular) * vec3(0.32, 0.75, 0.85);
                gl_FragColor = vec4(color, 1.0);
            }
        `

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcColorFactor,
            blendDst: THREE.OneMinusSrcColorFactor
        })

        return material
    }

    get Mesh() {
        return this._mesh
    }

    update(dt) {
        this._material.uniforms.u_time.value = dt / 1500
    }
}

export default Water