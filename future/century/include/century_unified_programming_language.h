#ifndef CENTURY_UNIFIED_PROGRAMMING_LANGUAGE_H
#define CENTURY_UNIFIED_PROGRAMMING_LANGUAGE_H

#include <cstdint>
#include <string>

namespace century_language {

enum class ExecutionModel {
    Classical,
    Photonic,
    Quantum,
    Neuromorphic,
    Reversible,
    Distributed,
    Autonomous
};

struct UnifiedType {
    std::string name;
    std::string semantics;
    bool is_verified = false;
    bool is_pure = false;
    bool is_probabilistic = false;
};

class UnifiedProgrammingLanguage {
public:
    UnifiedProgrammingLanguage();
    ~UnifiedProgrammingLanguage() = default;

    void DeclareResourceBudget(uint64_t energy_nj, uint64_t latency_ps, uint64_t memory_bytes);
    void CompileForTarget(ExecutionModel model, const std::string& target_name);
    void VerifySafetyProperties(const std::string& contract_name);
    void GenerateProofCertificate(const std::string& theorem_name);
    void PrintLanguageSpec() const;

private:
    ExecutionModel active_model_ = ExecutionModel::Classical;
    uint64_t energy_budget_nj_ = 0;
    uint64_t latency_budget_ps_ = 0;
    uint64_t memory_budget_bytes_ = 0;
    bool verified_runtime_ = false;
};

} // namespace century_language

#endif // CENTURY_UNIFIED_PROGRAMMING_LANGUAGE_H
