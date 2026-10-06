"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  CloudServices,
  Essentials,
  FindAndReplace,
  Font,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Table,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Underline,
  Undo,
  type Editor
} from "ckeditor5";

import { attachSupabaseUploadAdapter } from "@/lib/ckeditor-upload";
import { sanitizeRichHtml } from "@/lib/rich-html";

import "ckeditor5/ckeditor5.css";

/**
 * Editor de texto rico (CKEditor 5) usado no painel administrativo.
 * Publica o HTML sanitizado num input oculto (name) consumido pelo formulário.
 * A barra de ferramentas cobre blocos/estilos, formatação básica, listas e
 * alinhamento, mídia (imagem/vídeo/tabela/citação), fontes/cores e ferramentas
 * avançadas (desfazer/refazer, código HTML, localizar/substituir).
 */
export default function CkEditorField({
  name,
  id,
  label,
  value = "",
  hint,
  placeholder = "Escreva o conteúdo…"
}: {
  name: string;
  id?: string;
  label?: string;
  value?: string;
  hint?: string;
  placeholder?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [initialData] = useState<string>(() => sanitizeRichHtml(value));

  // Mantém o input oculto sincronizado com o HTML do editor.
  const sync = useCallback((raw: string) => {
    const clean = sanitizeRichHtml(raw);
    if (hiddenRef.current) hiddenRef.current.value = clean;
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-600">
          {label}
        </span>
      )}

      {/* Valor final vai neste input oculto: é o que o servidor recebe. */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialData} />

      <div className="ck-admin overflow-hidden rounded-sm border border-navy-800/15">
        <CKEditor
          editor={ClassicEditor}
          data={initialData}
          id={id}
          onReady={(editor: Editor) => attachSupabaseUploadAdapter(editor)}
          onChange={(_evt, editor: Editor) => sync(editor.getData())}
          config={{
            licenseKey: "GPL",
            placeholder,
            plugins: [
              Alignment,
              Autoformat,
              BlockQuote,
              Bold,
              CloudServices,
              Essentials,
              FindAndReplace,
              Font,
              FontBackgroundColor,
              FontColor,
              FontFamily,
              FontSize,
              GeneralHtmlSupport,
              Heading,
              HorizontalLine,
              Image,
              ImageCaption,
              ImageInsert,
              ImageResize,
              ImageStyle,
              ImageToolbar,
              ImageUpload,
              Indent,
              Italic,
              Link,
              List,
              MediaEmbed,
              Paragraph,
              PasteFromOffice,
              RemoveFormat,
              SourceEditing,
              SpecialCharacters,
              SpecialCharactersArrows,
              SpecialCharactersCurrency,
              SpecialCharactersEssentials,
              SpecialCharactersLatin,
              SpecialCharactersMathematical,
              SpecialCharactersText,
              Strikethrough,
              Table,
              TableCellProperties,
              TableColumnResize,
              TableProperties,
              TableToolbar,
              Underline,
              Undo
            ],
            toolbar: {
              items: [
                "undo",
                "redo",
                "|",
                "heading",
                "fontFamily",
                "fontSize",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "link",
                "removeFormat",
                "|",
                "bulletedList",
                "numberedList",
                "outdent",
                "indent",
                "alignment",
                "|",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "insertImage",
                "mediaEmbed",
                "insertTable",
                "blockQuote",
                "horizontalLine",
                "specialCharacters",
                "|",
                "findAndReplace",
                "sourceEditing"
              ],
              shouldNotGroupWhenFull: true
            },
            image: {
              toolbar: [
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "|",
                "toggleImageCaption",
                "imageTextAlternative",
                "|",
                "resizeImage",
                "|",
                "linkImage"
              ]
            },
            table: {
              contentToolbar: [
                "tableColumn",
                "tableRow",
                "mergeTableCells",
                "tableProperties",
                "tableCellProperties"
              ]
            },
            list: {
              properties: { styles: true, startIndex: true, reversed: true }
            }
          }}
        />
      </div>

      {hint && <p className="text-[11px] text-navy-400">{hint}</p>}
    </div>
  );
}
