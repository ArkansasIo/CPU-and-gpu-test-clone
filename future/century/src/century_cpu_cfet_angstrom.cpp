#include "../include/century_cpu_cfet_angstrom.h"

#include <cmath>
#include <iomanip>
#include <iostream>

namespace century_2035 {

CenturyCfetProcessor::CenturyCfetProcessor() {
    std::cout << "[CENTURY 2035] Instantiating 1nm CFET 3D Monolithic Angstrom Processor...\n";
}

void CenturyCfetProcessor::InitializeSiliconSubstrate() {
    std::cout << "[CENTURY 2035] Aligning 4-Ribbon CFET Stack...\n";
    backside_power_engaged_ = false;
    optical_fabric_locked_ = false;
}

void CenturyCfetProcessor::ConfigureBacksidePowerRails(float target_vcore) {
    cfet_geometry_.vdd_nominal_voltage = target_vcore;
    backside_power_engaged_ = true;
    std::cout << "[CENTURY 2035] Backside power rails engaged at " << target_vcore << " V.\n";
}

void CenturyCfetProcessor::ActivateOpticalCoPackagedWaveguides() {
    optical_fabric_locked_ = true;
    std::cout << "[CENTURY 2035] Co-packaged optical fabric locked with "
              << optical_cpo_.wavelength_channels << " channels.\n";
}

void CenturyCfetProcessor::DispatchHyperDenseComputeTask(uint32_t task_count, uint64_t instruction_depth) {
    std::cout << "[CENTURY 2035] Dispatching " << task_count
              << " tasks across 32 P-Cores and 64 E-Cores.\n";
    current_die_temperature_c_ = 34.0f + std::min(22.0f, static_cast<float>(task_count) / 1000.0f * 4.5f);
    (void)instruction_depth;
}

void CenturyCfetProcessor::MeasureMicrofluidicDiamondJunctionTemp(float ambient_celsius) {
    float cooling_efficiency = 0.94f;
    current_die_temperature_c_ = ambient_celsius + (current_die_temperature_c_ - ambient_celsius) * (1.0f - cooling_efficiency);
    std::cout << "[CENTURY 2035] Junction stabilized at " << std::fixed << std::setprecision(1)
              << current_die_temperature_c_ << " C.\n";
}

void CenturyCfetProcessor::PrintArchitectureTelemetry() const {
    std::cout << "===================================================================\n";
    std::cout << " CENTURY 2035 1nm CFET PROCESSOR TELEMETRY REPORT                  \n";
    std::cout << "===================================================================\n";
    std::cout << " Node Target          : 10 Angstroms (1.0 nm)\n";
    std::cout << " Transistor Count     : 450,000,000,000\n";
    std::cout << " P-Cores              : 32\n";
    std::cout << " E-Cores              : 64\n";
    std::cout << " Frequency            : 8.40 GHz\n";
    std::cout << " Optical Bandwidth    : 12.8 Tbps\n";
    std::cout << " Status               : " << (backside_power_engaged_ && optical_fabric_locked_ ? "ONLINE" : "STANDBY") << "\n";
    std::cout << "===================================================================\n";
}

} // namespace century_2035
