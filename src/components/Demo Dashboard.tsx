import React from "react";

interface PowerBiDashboardProps {
  embedUrl: string;
}

const PowerBiDashboard: React.FC<PowerBiDashboardProps> = ({ embedUrl }) => {
  return (
    <div style={{ width: "100%", height: "800px" }}>
      <iframe
        title="Power BI Dashboard"
        width="100%"
        height="100%"
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default PowerBiDashboard;
