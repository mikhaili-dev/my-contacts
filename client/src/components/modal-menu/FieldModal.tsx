import { useRef } from "react"
import "../../styles/modal-menu/modal-field.css"

interface FieldModalProps {
    initialWeb: string
    initialLink: string
    addField: () => void
    dataKey: string
}

export function FieldModal({initialWeb, initialLink, addField, dataKey}: FieldModalProps) {
    const web = useRef<HTMLInputElement>(null)
    const link = useRef<HTMLInputElement>(null)

    function changeInputHandler(): void {
        /*
            Добавление и удаление полей в модальном окне происходит автоматически.

            При изменении web/link проверяем, нужно ли добавить ещё одно поле снизу, 
            или, наоборот, нужно ли удалить поле снизу
        */
        if (isAddingFieldNeeded()) {
            addField()
        }
        if (isRemovingFieldNeeded()) {
            removeLastField()
        }
    }
    function isAddingFieldNeeded(): boolean {
        /*
            Новое поле добавляется в случае, если
            и в web, и в link последнего поля есть хотя бы один символ 
        */
        if (web.current!.value && link.current!.value && isItLastElem()) {
            return true
        }
        return false
    }
    function isRemovingFieldNeeded(): boolean {
        const fields = document.querySelectorAll('.modal-field-wrapper')
        const lastField = fields[fields.length - 1]

        if (!lastField) return false

        const lastFieldWebValue: string = lastField.querySelector<HTMLInputElement>('#web')!.value
        const lastFieldLinkValue: string = lastField.querySelector<HTMLInputElement>('#link')!.value

        //Если в строке (сочетание web/link) есть хотя бы один символ - её не нужно удалять

        if (lastFieldWebValue || lastFieldLinkValue) return false

        const beforeLastField = lastField.previousElementSibling

        //Если в последней строке отсутствуют значения, но она же является первой строкой - её не нужно удалять

        if (!beforeLastField || !beforeLastField.classList.contains('modal-field-wrapper')) return false

        const beforeLastFieldWebValue: string = beforeLastField.querySelector<HTMLInputElement>('#web')!.value
        const beforeLastFieldLinkValue: string = beforeLastField.querySelector<HTMLInputElement>('#link')!.value

        //Если строка не является первой и является пустой, но перед ней есть заполненная строка - её не нужно удалять

        if (beforeLastFieldWebValue && beforeLastFieldLinkValue) return false

        return true
    }
    function removeLastField(): void {
        const fields = document.querySelectorAll('.modal-field-wrapper')
        const lastField = fields[fields.length - 1]

        if (lastField) lastField.remove()
    }
    function isItLastElem(): boolean {
        const fields = document.querySelectorAll('.modal-field-wrapper')
        const lastField = fields[fields.length - 1]

        if (!lastField) return true

        const keyOfLast = lastField.getAttribute('data-key')

        if (dataKey === keyOfLast) {
            return true
        }

        return false
    }

    return (
        <div className="modal-field-wrapper" data-key={dataKey}>
            <input 
                id="web" 
                ref={web}
                defaultValue={initialWeb}
                onChange={changeInputHandler}
                minLength={1}
            ></input>
            <input 
                id="link" 
                ref={link}
                defaultValue={initialLink}
                onChange={changeInputHandler}
                minLength={1}
            ></input>
        </div>
    )
}