from physics_sanity_check import PhysQuantity
from typing import Dict

def fake_gravity_model(mass1: PhysQuantity, mass2: PhysQuantity, distance: PhysQuantity) -> Dict[str, PhysQuantity]:
    # G = 6.674e-11 N m^2 / kg^2
    # But let's assume the user forgot to handle units and just used values!
    # F = G * m1 * m2 / r^2
    
    G = 6.674e-11
    m1 = mass1.value  # BUG: assumes kg
    m2 = mass2.value  # BUG: assumes kg
    r = distance.value # BUG: assumes m
    
    f_val = G * m1 * m2 / (r**2)
    
    # User returns it wrapped as Newtons
    return {
        "force": PhysQuantity.from_string(f"{f_val} N", mass1.metadata) # Reusing metadata just for test
    }
