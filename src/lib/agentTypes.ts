export interface AutonomousDecision {
  decision_parameter: string;
  decision_threshold: string;
  decision_outcome: "approved" | "denied";
  risk_assessment: {
    risk_type: string;
    risk_level: "low" | "medium" | "high";
    risk_mitigation_plan?: string;
  };
  impact_analysis: {
    impact_area: string;
    impact_level: "minor" | "moderate" | "significant";
    analysis_report?: string;
  };
}

export interface CollaborativeDecision extends AutonomousDecision {
  consensus_type: "voting" | "discussion";
  participants: string[];
  consensus_outcome: "agreement_reached" | "no_agreement";
  oversight_type: "review" | "approval";
  oversight_feedback: "approved" | "needs_revision";
  oversight_duration: "quick" | "detailed";
}
