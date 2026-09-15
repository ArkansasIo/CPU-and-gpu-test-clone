#include "../include/century_neuromorphic_biosilicon.h"

#include <iostream>

namespace century_2075 {

NeuromorphicBioSiliconEngine::NeuromorphicBioSiliconEngine() {
    std::cout << "[CENTURY 2075] Booting synthetic neuromorphic bio-silicon mesh...\n";
}

void NeuromorphicBioSiliconEngine::BootSynapticMesh() {
    synaptic_mesh_active_ = true;
    std::cout << "[CENTURY 2075] Synaptic crossbar online. 100B neurons and 100T memristive weights ready.\n";
}

void NeuromorphicBioSiliconEngine::PropagateActionPotentials(uint64_t spike_count) {
    std::cout << "[CENTURY 2075] Propagating " << spike_count << " spike events through plastic synaptic matrix.\n";
}

void NeuromorphicBioSiliconEngine::ModulateGlialCalciumWave(float astrocyte_activity) {
    std::cout << "[CENTURY 2075] Astrocyte wave modulation set to " << astrocyte_activity << ".\n";
}

void NeuromorphicBioSiliconEngine::PrintArchitectureTelemetry() const {
    std::cout << "===================================================================\n";
    std::cout << " CENTURY 2075 BIO-SILICON NEUROMORPHIC ENGINE REPORT               \n";
    std::cout << "===================================================================\n";
    std::cout << " Neurons               : 100,000,000,000\n";
    std::cout << " Synapses              : 100,000,000,000,000\n";
    std::cout << " Energy per spike      : 10 fJ\n";
    std::cout << " Power draw            : 18.5 W\n";
    std::cout << " Status                : " << (synaptic_mesh_active_ ? "ACTIVE" : "OFFLINE") << "\n";
    std::cout << "===================================================================\n";
}

} // namespace century_2075
