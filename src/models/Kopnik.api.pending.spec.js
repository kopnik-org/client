import api from "../api";
import {bottle, container} from "../bottle/bottle";
import {KopnikApiError} from "../KopnikError";
import {AbstractSync, Kopnik} from "./index";
import {collection, object, scalar} from "../decorators/sync";
import reset from "../../tests/utils/reset";
import parse from "@/models/utils/parse";

// real fetch
container.constants.di.fetch = true

describe('models User get pending', () => {
    let main
    beforeEach(async () => {
        AbstractSync.clearCache()
        main = await Kopnik.create({
            status: Kopnik.Status.PENDING,
        }, 'main')
        await main.login()
    })

    it('get(self)', async () => {
        const user = new Kopnik()
        await user.reload()
        expect(user.id).toBe(main.id)
    })
    it('get(somebody)', async () => {
        const somebody = await Kopnik.create()
        const user = await Kopnik.get(somebody.id)
        expect(user.id).toBe(somebody.id)
    })
    it('reloadWitnessRequests()', async () => {
      await main.reloadWitnessRequests()
      expect(main.witnessRequests).toEqual([])
    })
    it('isMessagesFromGroupAllowed()', async () => {
        let result = await main.isMessagesFromGroupAllowed()
    })
    it('setLocale()', async () => {
        await main.setLocale({name: 'en'})
        await main.reload()
        expect(main.locale).toMatchObject({name: "en"})
    })
    it('updateProfile()', async () => {
      const witness = await Kopnik.create({
        isWitness: true,
      }, 'witness')
      const request =new Kopnik()
      request.merge(parse(Kopnik, main.plain))
      const delta={
        role: Kopnik.Role.Female,
        // passport: '0001',
        location: {
          lat: 1,
          lng: 1
        },
        firstName: '1',
        lastName: '2',
        patronymic: '3',
        // birthYear: 2000,
        locale: container.localeManager.currentLocale,
        isLoaded: true,
      }
      request.merge(delta)
      await main.updateProfile(request, [])

      await main.reload()
      expect(main.status).toBe(Kopnik.Status.PENDING)
      expect(main).toMatchObject(delta)
    })
    describe('tree', () => {
        describe('putForemanRequest()', () => {
            it('success', async () => {
                const foreman = await Kopnik.create({}, 'foreman')
                try {
                    await main.putForemanRequest(foreman)
                    throw new Error("should not be hire")
                } catch (err) {
                    expect(err).toBeKopnikError(1000+403)
                }
            })
        })
    })
})
