const metric_dao = require("./metric_dao")
// @ponicode
describe("metric_dao.insert", () => {
    test("0", async () => {
        await metric_dao.insert(true)
    })

    test("1", async () => {
        await metric_dao.insert(false)
    })

    test("2", async () => {
        await metric_dao.insert(undefined)
    })
})
