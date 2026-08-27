//Qt Shader converted by Gemini

#version 440

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float u_time;     // Passed from C++ / QML for animation
    vec2 u_size;      // Resolution of the item
};

#define animationActive 1
#define centerOfBar 0.5

void main() {
    // Qt uses qt_TexCoord0 which is already normalized (0.0 to 1.0)
    vec2 uv = qt_TexCoord0;
    
    float barHeight = 0.052;
    float barCenter = 0.5;
    
    vec3 col = vec3(0.05, 0.05, 0.08);
    
    if (uv.y > (barCenter - barHeight) && uv.y < (barCenter + barHeight)) {
        vec3 blue  = vec3(0.0, 0.4, 1.0);
        vec3 white = vec3(1.0, 1.0, 1.0);
        vec3 red   = vec3(1.0, 0.1, 0.2);
        
        if (uv.x < centerOfBar) {
            float t = uv.x * 2.0;
            col = mix(blue, white, t);
        } else if (uv.x > centerOfBar) {
            float t = (uv.x - 0.5) * 2.0;
            col = mix(white, red, t);
        }
        
        #if animationActive 
        float distFromCenter = abs(uv.x - 0.5);
        float waveTime = fract(u_time * 1.0);
        
        float wave = smoothstep(0.1, 0.0, abs(distFromCenter - (waveTime * 0.5)));
        col += wave * 0.5;
        
        float particlePosRight = 0.5 + (waveTime * 0.5);
        float particlePosLeft  = 0.5 - (waveTime * 0.5);
        
        float distRight = length(vec2(uv.x, uv.y) - vec2(particlePosRight, barCenter));
        float distLeft  = length(vec2(uv.x, uv.y) - vec2(particlePosLeft, barCenter));
        
        float particleRadius = 0.2;
        float particleRight = smoothstep(particleRadius, 0.0, distRight);
        float particleLeft  = smoothstep(particleRadius, 0.0, distLeft);
        
        vec3 particleColor = vec3(1.0, 1.0, 1.0);
        col = mix(col, particleColor, (particleRight + particleLeft) * 0.7);
        #endif
        
        vec3 edgeColor  = vec3(0.01, 0.01, 0.2);
        vec3 midColor   = vec3(0.9, 0.9, 0.9);

        float barTop = barCenter + barHeight;
        float barBottom = barCenter - barHeight;

        vec3 overlay = vec3(1.0);

        if (uv.y >= barBottom && uv.y <= barTop) {
            float t = (uv.y - barBottom) / (barTop - barBottom);

            if (t < 0.5) {
                float localT = t * 2.0;
                overlay = mix(edgeColor, midColor, localT);
            } else {
                float localT = (t - 0.5) * 2.0;
                overlay = mix(midColor, edgeColor, localT);
            }
        }
        
        col *= overlay;
    }
    
    // Multiply by qt_Opacity to support fading elements smoothly in QML
    fragColor = vec4(col, 1.0) * qt_Opacity;
}
