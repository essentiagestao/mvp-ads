import { render, screen } from "@testing-library/react";
import CampaignObjective from "../CampaignObjective";

test("renderiza os campos da Etapa 1", () => {
  render(
    <CampaignObjective
      campaignName=""
      objective="LINK_CLICKS"
      onChange={() => {}}
    />
  );

  expect(screen.getByLabelText(/Nome da Campanha/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Objetivo/i)).toBeInTheDocument();
});
