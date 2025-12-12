import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"

export default Controller({
  async getSuggestions(req, res) {
    const userId = req.user.id

    // const 
  },

  async getMatches() {},
})
