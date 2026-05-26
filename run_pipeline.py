import os
import sys
import subprocess
import time

def run_script(script_name):
    print(f"\n==================================================")
    print(f"Executing: {script_name}")
    print(f"==================================================")
    
    start_time = time.time()
    result = subprocess.run([sys.executable, script_name], capture_output=False, text=True)
    duration = time.time() - start_time
    
    if result.returncode != 0:
        print(f"Error: {script_name} failed with exit code {result.returncode}")
        sys.exit(1)
        
    print(f"Completed {script_name} successfully in {duration:.2f} seconds.")

def main():
    print("==================================================")
    print("         ProSlim Microbiome AI Workflow           ")
    print("==================================================")
    
    pipeline_scripts = [
        "scripts/setup_project.py",
        "scripts/prepare_real_dataset.py",
        "scripts/data_download.py",
        "scripts/metadata_cleaning.py",
        "scripts/data_filtering_qc.py",
        "scripts/feature_engineering.py",
        "scripts/obesity_model.py",
        "scripts/responder_model.py",
        "scripts/strain_annotation.py",
        "scripts/combination_recommend.py",
        "scripts/visualization.py"
    ]
    
    start_pipeline = time.time()
    
    for script in pipeline_scripts:
        if not os.path.exists(script):
            print(f"Error: Pipeline script {script} not found!")
            sys.exit(1)
        run_script(script)
        
    total_duration = time.time() - start_pipeline
    
    print("\n==================================================")
    print("ProSlim Microbiome AI Full Pipeline executed successfully!")
    print(f"Total time elapsed: {total_duration:.2f} seconds.")
    print("==================================================")
    print("Key Results Generated:")
    print(" - Unified Features: data/processed_data/microbiome_features.csv")
    print(" - Obesity Model: models/obesity_classifier/rf_obesity_classifier.pkl")
    print(" - Responder Model: models/responder_classifier/multitask_rf_responder.pkl")
    print(" - Strain Scores: results/candidate_strain_scores/strain_functional_scores.csv")
    print(" - Combination Rankings: results/combination_ranking/subgroup_combination_recommendations.csv")
    print(" - Figures: results/reports/figures/")
    print(" - Clinical Report (HTML): results/reports/proslim_clinical_report.html")
    print(" - Clinical Report (Markdown): results/reports/proslim_clinical_report.md")
    print("==================================================")

if __name__ == "__main__":
    main()
