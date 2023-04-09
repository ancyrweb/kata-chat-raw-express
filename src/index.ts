import { getLogger } from "./framework/container";
import { app } from "./http/app";

app.listen(3000, () => {
  const logger = getLogger();
  logger.info("Server started on port 3000");
});
