//Shadertoy syntax

#define animationActive 1
#define centerOfBar 0.5

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 1. Normalize coordinates (0.0 to 1.0)
    vec2 uv = fragCoord / iResolution.xy;
    
    // Define the central bar area (vertical thickness)
    float barHeight = 0.052;
    float barCenter = 0.5;
    
    // Background color (dark grey)
    vec3 col = vec3(0.05, 0.05, 0.08);
    vec4 col1 = vec4(1, 11, 58, 28);
    
    // Check if we are inside the horizontal bar
    if (uv.y > (barCenter - barHeight) && uv.y < (barCenter + barHeight)) {
        
        // --- STEP 1: 3-Color Gradient ---
        vec3 blue  = vec3(0.0, 0.4, 1.0);
        vec3 white = vec3(1.0, 1.0, 1.0);
        vec3 red   = vec3(1.0, 0.1, 0.2);
        
        // Split the bar into left and right halves using your exact logic
        if (uv.x < centerOfBar) {
            float t = uv.x * 2.0; // scales 0.0-0.5 to 0.0-1.0
            col = mix(blue, white, t);
        } else if (uv.x > centerOfBar) {
            float t = (uv.x - 0.5) * 2.0; // scales 0.5-1.0 to 0.0-1.0
            col = mix(white, red, t);
        }
        #if animationActive 
        // --- STEP 2: Unidirectional Glow Wave from Center ---
        float distFromCenter = abs(uv.x - 0.5); // 0 at center, 0.5 at edges
        float waveTime = fract(iTime * 1.0);     // Loops from 0.0 to 1.0 continuously
        
        // Create a traveling pulse line
        float wave = smoothstep(0.1, 0.0, abs(distFromCenter - (waveTime * 0.5)));
        col += wave * 0.5; // Add bright glow to the underlying color
        
        // --- STEP 3: Two Circular Particles Following the Wave ---
        float particlePosRight = 0.5 + (waveTime * 0.5);
        float particlePosLeft  = 0.5 - (waveTime * 0.5);
        
        // Calculate distance from current pixel to the moving particle centers
        float distRight = length(vec2(uv.x, uv.y) - vec2(particlePosRight, barCenter));
        float distLeft  = length(vec2(uv.x, uv.y) - vec2(particlePosLeft, barCenter));
        
        // Circular gradient / soft glow for the particles (radius 0.04)
        float particleRadius = 0.2;
        float particleRight = smoothstep(particleRadius, 0.0, distRight);
        float particleLeft  = smoothstep(particleRadius, 0.0, distLeft);
        
        // Blend a bright white/yellow highlight where the particles are
        vec3 particleColor = vec3(1.0, 1.0, 1.0);
        col = mix(col, particleColor, (particleRight + particleLeft) * 0.7);
        #endif
        
        // Overlay vertical gradient
        
        vec3 edgeColor  = vec3(0.01, 0.01, 0.2); // Darker blue-grey for top/bottom
        vec3 midColor   = vec3(0.9, 0.9, 0.9); // Full brightness for the center

        float barTop = barCenter + barHeight;
        float barBottom = barCenter - barHeight;

        vec3 overlay = vec3(1.0);

        // Check if we are inside the bar vertically
        if (uv.y >= barBottom && uv.y <= barTop) {
            // Normalize uv.y so 0.0 is the bottom of the bar and 1.0 is the top of the bar
            float t = (uv.y - barBottom) / (barTop - barBottom);

            // Create a symmetric gradient: dark at edges (0.0 and 1.0), bright in the middle (0.5)
            // We can use a parabola or a split mix:
            if (t < 0.5) {
                // Bottom half: blend from edge color to middle color
                float localT = t * 2.0;
                overlay = mix(edgeColor, midColor, localT);
            } else {
                // Top half: blend from middle color to edge color
                float localT = (t - 0.5) * 2.0;
                overlay = mix(midColor, edgeColor, localT);
            }
        }
        
        col *= overlay;
            
    }
    
    // Output final pixel color
    fragColor = vec4(col, 1.0);
}
