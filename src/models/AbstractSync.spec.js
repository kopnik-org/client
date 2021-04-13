import {Kopnik} from "./index";
import {bottle, container} from "../bottle/bottle";
import {KopnikApiError} from "../KopnikError";
import Locale from "../locales/Locale";
import LocaleManger from "@/locales/LocaleManager";

describe('models Kopnik', () => {
    /** @type {Kopnik} */
    let main
    beforeEach(() => {
        main = new Kopnik()
        Kopnik.clearCache()
    })
    describe('merge', () => {
        it('id', async () => {
            main.id = undefined
            main.merge({id: 10})

            expect(main.id).toBe(10)
        })

        it('scalar', async () => {
            main.firstName = "Павел"
            main.merge({firstName: "Ярослав"})

            expect(main.firstName).toBe("Ярослав")
        })

        it('do not merge missing scalar', async () => {
            main.firstName = "Ярослав"
            main.merge({id: 10})

            expect(main.firstName).toBe("Ярослав")
        })
        it('object', async () => {
            main.witness = undefined
            main.merge({witness: Kopnik.getReference(1)})

            expect(main.witness).toBe(Kopnik.getReference(1))
        })
        it('do not merge missing object', async () => {
            main.witness = Kopnik.getReference(1)
            main.merge({id: 10})

            expect(main.witness).toBe(Kopnik.getReference(1))
        })

        it('merge null', async () => {
            main.witness = Kopnik.getReference(1)
            main.merge({witness: null})

            expect(main.witness).toBe(null)
        })

        it('merge isLoaded', async () => {
            main.merge({isLoaded: true})

            expect(main.isLoaded).toBe(true)
        })
        it('merge locale', async () => {
            main.merge({locale: container.localeManager.currentLocale})

            expect(main.locale).toBeInstanceOf(Locale)
        })
        it('merge collection as object', async () => {
            main.merge({subordinates: [Kopnik.getReference(1000)]})

            expect(main.subordinates).toHaveLength(1)
            expect(main.subordinates[0].id).toBe(1000)
        })
    })

    describe('plain', () => {
        it('Kopnik.plain', async () => {
            let main = Kopnik.getReference(1)
            main.firstName = "Ярослав"
            main.witness = Kopnik.getReference(2)
            main.locale = container.localeManager.currentLocale
            main.subordinates = [Kopnik.getReference(3), Kopnik.getReference(4)]

            expect(main.plain).toMatchObject({
                id: 1,
                firstName: "Ярослав",
                witness: 2,
                locale: 'ru',
            })
            expect(main.plain.subordinates).toBeInstanceOf(Array)
            expect(main.plain.subordinates.length).toBe(2)
            expect(main.plain.subordinates[0]).toBe(3)
        })
    })
})
