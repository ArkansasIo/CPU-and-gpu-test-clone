#include "../include/century_quantum_entangled_bus.h"

#include <iostream>

namespace century_bus {

QuantumEntangledBus::QuantumEntangledBus() {
    std::cout << "[CENTURY BUS] Initializing quantum entangled interconnect fabric...\n";
}

void QuantumEntangledBus::GenerateBellPairLattice(uint32_t pair_count_billions) {
    bell_pairs_locked_ = true;
    std::cout << "[CENTURY BUS] Generated " << pair_count_billions << " billion Bell pairs for teleportation fabric.\n";
}

void QuantumEntangledBus::TeleportStateVector(uint32_t source_node, uint32_t target_node, uint64_t bit_count) {
    std::cout << "[CENTURY BUS] Teleporting " << bit_count << " bits from node " << source_node
              << " to node " << target_node << " with zero classical latency.\n";
}

void QuantumEntangledBus::PrintBusTelemetry() const {
    std::cout << "===================================================================\n";
    std::cout << " CENTURY QUANTUM ENTANGLED EIB (Q-EIB) REPORT                     \n";
    std::cout << "===================================================================\n";
    std::cout << " Active nodes          : " << active_entanglement_nodes_ << "\n";
    std::cout << " Bell pair rate        : " << current_bell_rate_ghz_ << " GHz\n";
    std::cout << " Teleportation mode    : " << (bell_pairs_locked_ ? "ENTANGLED" : "OFFLINE") << "\n";
    std::cout << "===================================================================\n";
}

} // namespace century_bus
