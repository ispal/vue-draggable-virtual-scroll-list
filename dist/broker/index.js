var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Inject, Prop } from 'vue-property-decorator';
import { instructionNames as draggableEvents } from './draggable-policy';
import VirtualScrollListPolicy from './virtual-scroll-list-policy';
export var SortableEvents;
(function (SortableEvents) {
    SortableEvents[SortableEvents["start"] = 0] = "start";
    SortableEvents[SortableEvents["add"] = 1] = "add";
    SortableEvents[SortableEvents["remove"] = 2] = "remove";
    SortableEvents[SortableEvents["update"] = 3] = "update";
    SortableEvents[SortableEvents["end"] = 4] = "end";
    SortableEvents[SortableEvents["choose"] = 5] = "choose";
    SortableEvents[SortableEvents["unchoose"] = 6] = "unchoose";
    SortableEvents[SortableEvents["sort"] = 7] = "sort";
    SortableEvents[SortableEvents["filter"] = 8] = "filter";
    SortableEvents[SortableEvents["clone"] = 9] = "clone";
})(SortableEvents || (SortableEvents = {}));
export var VirtualScrollEvents;
(function (VirtualScrollEvents) {
    VirtualScrollEvents[VirtualScrollEvents["scroll"] = 0] = "scroll";
    VirtualScrollEvents[VirtualScrollEvents["totop"] = 1] = "totop";
    VirtualScrollEvents[VirtualScrollEvents["tobottom"] = 2] = "tobottom";
    VirtualScrollEvents[VirtualScrollEvents["resized"] = 3] = "resized";
})(VirtualScrollEvents || (VirtualScrollEvents = {}));
var sortableEvents = Object.values(SortableEvents)
    .filter(function (x) { return typeof x === 'string'; });
var virtualScrollEvents = Object.values(VirtualScrollEvents)
    .filter(function (x) { return typeof x === 'string'; });
// A factory function which will return DraggableVirtualList constructor.
export default function createBroker(VirtualList) {
    var Broker = /** @class */ (function (_super) {
        __extends(Broker, _super);
        function Broker() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.vlsPolicy = new VirtualScrollListPolicy();
            return _this;
        }
        // Override
        //
        // Return the result of VirtualList.options.methods.getRenderSlots
        // which would be wrapped by Draggable.
        // Draggable's change events would be converted to input
        // events and emitted.
        Broker.prototype.getRenderSlots = function (h) {
            var _this = this;
            var _a = this, Draggable = _a.Draggable, DraggablePolicy = _a.DraggablePolicy;
            var slots = VirtualList.options.methods.getRenderSlots.call(this, h);
            // Add index on the slots
            slots.forEach(function (slot, index) {
                slot.data.attrs = {
                    'data-index': index + _this.range.start
                };
            });
            var draggablePolicy = new DraggablePolicy(this.dataKey, this.dataSources, this.range);
            if (this.vlsPolicy.draggingVNode) {
                // ドラッグ中の要素を vls に差し込む
                slots.splice(this.vlsPolicy.draggingIndex, 1, this.vlsPolicy.draggingVNode);
            }
            return [
                h(Draggable, {
                    props: {
                        value: this.dataSources,
                        // policy will find the real item from x.
                        clone: function (x) { return draggablePolicy.findRealItem(x); },
                    },
                    on: __assign(__assign({ 
                        // Convert Draggable's change events to input events.
                        change: function (e) {
                            if (draggableEvents.some(function (n) { return n in e; })) {
                                _this.$emit('input', draggablePolicy.updatedSources(e, _this.vlsPolicy.draggingRealIndex));
                            }
                        } }, sortableEventHandlers(this)), { start: function (e) {
                            _this.vlsPolicy.onDragStart(e, _this.range, slots);
                            _this.$emit('start', _this.buildEventWithRealIndex(e));
                        }, end: function (e) {
                            _this.vlsPolicy.onDragEnd();
                            _this.$emit('end', _this.buildEventWithRealIndex(e));
                        } }),
                    attrs: this.$attrs,
                }, slots),
            ];
        };
        Broker.prototype.buildEventWithRealIndex = function (e) {
            var _a, _b, _c, _d, _e, _f;
            var fromFirstChild = (_a = e.from) === null || _a === void 0 ? void 0 : _a.firstElementChild;
            var toFirstChild = (_b = e.to) === null || _b === void 0 ? void 0 : _b.firstElementChild;
            var fromFirstIndex = parseInt((_d = (_c = fromFirstChild === null || fromFirstChild === void 0 ? void 0 : fromFirstChild.dataset) === null || _c === void 0 ? void 0 : _c.index) !== null && _d !== void 0 ? _d : '0');
            var toFirstIndex = parseInt((_f = (_e = toFirstChild === null || toFirstChild === void 0 ? void 0 : toFirstChild.dataset) === null || _e === void 0 ? void 0 : _e.index) !== null && _f !== void 0 ? _f : '0');
            e.realNewIndex = toFirstIndex + e.newIndex;
            e.realOldIndex = fromFirstIndex + e.oldIndex;
            return e;
        };
        __decorate([
            Prop()
        ], Broker.prototype, "estimateSize", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "extraProps", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "keeps", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "dataKey", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "dataSources", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "dataComponent", void 0);
        __decorate([
            Inject()
        ], Broker.prototype, "Draggable", void 0);
        __decorate([
            Inject()
        ], Broker.prototype, "DraggablePolicy", void 0);
        Broker = __decorate([
            Component
        ], Broker);
        return Broker;
    }(VirtualList));
    return Broker;
}
// Returns handlers which propagate virtual-list's events.
export function virtualScrollEventHandlers(context) {
    return virtualScrollEvents.reduce(function (acc, eventName) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[eventName] = context.$emit.bind(context, eventName), _a)));
    }, {});
}
// Returns handlers which propagate sortable's events.
export function sortableEventHandlers(context) {
    return sortableEvents.reduce(function (acc, eventName) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[eventName] = context.$emit.bind(context, eventName), _a)));
    }, {});
}
//# sourceMappingURL=index.js.map