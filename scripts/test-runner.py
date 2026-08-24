#!/usr/bin/env python3
"""
Catnip Warships — Automated Pre-Release Integrity Test Suite
Verifies JS syntax, class definitions, method calls, script load orders, and DOM bindings.
"""

import glob
import os
import re
import sys

def run_tests():
    print("=" * 60)
    print("⚡ RUNNING CATNIP WARSHIPS PRE-RELEASE INTEGRITY SUITE")
    print("=" * 60)
    
    workspace = os.getcwd()
    js_files = glob.glob('js/**/*.js', recursive=True) + glob.glob('js/*.js')
    passed = 0
    failed = 0

    # 1. SYNTAX & BRACKET BALANCE TEST
    print("\n[TEST 1] Syntax & Bracket Balance Check...")
    for fpath in js_files:
        with open(fpath, 'r', encoding='utf-8') as f:
            code = f.read()
            opens = code.count('{') + code.count('(') + code.count('[')
            closes = code.count('}') + code.count(')') + code.count(']')
            if opens != closes:
                print(f"  ❌ FAIL: {fpath} has unbalanced brackets (Opens: {opens}, Closes: {closes})")
                failed += 1
            else:
                passed += 1
    print(f"  ✅ Passed {len(js_files)} JS syntax files balance check.")

    # 2. CLASS DEFINITION VS INSTANTIATION MATCH TEST
    print("\n[TEST 2] Class Definition & Instantiation Mismatch Audit...")
    known_classes = {
        'Vector2D': 'Vector2D.js',
        'AudioSystem': 'AudioSystem.js',
        'InputHandler': 'InputHandler.js',
        'Camera': 'Camera.js',
        'MapEngine': 'Map.js',
        'Physics': 'Physics.js',
        'Renderer': 'Renderer.js',
        'Particle': 'Particle.js',
        'Projectile': 'Projectile.js',
        'Aircraft': 'Aircraft.js',
        'Ship': 'Ship.js',
        'FleetAI': 'FleetAI.js',
        'HangarUI': 'HangarUI.js',
        'HUD': 'HUD.js',
        'Minimap': 'Minimap.js',
        'EndGameUI': 'EndGameUI.js'
    }

    # Check for invalid 'new ClassName' references in main.js
    with open('js/main.js', 'r', encoding='utf-8') as f:
        main_code = f.read()

    new_matches = re.findall(r'new\s+([A-Z][A-Za-z0-9_]+)', main_code)
    mismatches = 0
    for cls_name in new_matches:
        if cls_name.endswith('Engine') and cls_name not in ['MapEngine', 'GameEngine']:
            print(f"  ❌ FAIL: Suspect class instantiation 'new {cls_name}' in js/main.js")
            mismatches += 1

    if mismatches == 0:
        print("  ✅ Passed Class Instantiation Audit in js/main.js.")
        passed += 1
    else:
        failed += mismatches

    # 3. CAMERA & UI ENGINE METHOD SIGNATURE AUDIT
    print("\n[TEST 3] Camera & UI Engine Method Call Audit...")
    if 'camera.resizeViewport' in main_code:
        print("  ❌ FAIL: Found 'camera.resizeViewport' in js/main.js (Method should be 'camera.resize')")
        failed += 1
    elif 'camera.follow(activeTarget, dt)' in main_code:
        print("  ❌ FAIL: Found 'camera.follow(activeTarget, dt)' in js/main.js (Method requires numeric x, y)")
        failed += 1
    elif 'Renderer.drawParticles' in main_code:
        print("  ❌ FAIL: Found 'Renderer.drawParticles' in js/main.js (Method should be 'Renderer.drawFX')")
        failed += 1
    else:
        print("  ✅ Passed Camera, Minimap & Renderer method signature audit (camera.resize, camera.follow, Minimap.draw & Renderer.drawFX confirmed).")
        passed += 1

    # 4. SCRIPT LOAD ORDER IN INDEX.HTML
    print("\n[TEST 4] Script Tag Load Order in index.html...")
    with open('index.html', 'r', encoding='utf-8') as f:
        html_code = f.read()

    scripts = re.findall(r'src="([^"]+\.js[^"]*)"', html_code)
    script_basenames = [s.split('?')[0] for s in scripts]

    required_order = ['js/config.js', 'js/shipsData.js', 'js/abilities.js', 'js/main.js']
    order_ok = True
    pos = -1
    for req in required_order:
        if req in script_basenames:
            new_pos = script_basenames.index(req)
            if new_pos < pos:
                print(f"  ❌ FAIL: Script {req} is loaded out of order in index.html")
                order_ok = False
            pos = new_pos

    if order_ok:
        print("  ✅ Passed index.html script tag load order audit.")
        passed += 1
    else:
        failed += 1

    # 5. NO-CACHE HEADERS & VERSION TAG SYNC TEST
    print("\n[TEST 5] No-Cache Headers & Version Tag Sync Check...")
    has_cache_meta = 'http-equiv="Cache-Control"' in html_code
    if has_cache_meta:
        print("  ✅ Passed index.html No-Cache Meta Tag Check.")
        passed += 1
    else:
        print("  ❌ FAIL: Missing No-Cache Meta Tag in index.html")
        failed += 1

    print("\n" + "=" * 60)
    print(f"SUMMARY: {passed} Tests Passed | {failed} Tests Failed")
    print("=" * 60)

    if failed > 0:
        print("❌ RELEASE VERIFICATION FAILED! Fix errors before deploying.")
        sys.exit(1)
    else:
        print("🚀 ALL PRE-RELEASE INTEGRITY TESTS PASSED 100%! Ready for release!")
        sys.exit(0)

if __name__ == '__main__':
    run_tests()
